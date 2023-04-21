package aggregator_test

import (
	"context"
	"math/rand"
	"net"
	"reflect"
	"strings"
	"testing"
	"time"

	"go.example.com/sec/service-go-ip-info/internal/aggregator"

	"go.example.com/sec/service-go-ip-info/internal/setters"

	"go.uber.org/goleak"

	"github.com/pkg/errors"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
	"go.example.com/gl/logger"
	"go.example.com/sec/service-go-ip-info/internal/generated/rpc/service/dto"
	"go.example.com/sec/service-go-ip-info/internal/models"
	utilstests "go.example.com/sec/service-go-ip-info/pkg/tests"
)

var ErrTest = errors.New("ERR")

type DataSetterMock struct {
	fields []string
	data   map[string]dto.GetIPInfoOut
	ip     string
	err    error
}

func (s *DataSetterMock) SetData(data *dto.GetIPInfoOut) error {
	switch strings.Join(s.fields, ",") {
	case strings.Join(models.BlackOrWhitelistFields, ","):
		data.Whitelist = s.data[s.ip].Whitelist
		data.Blacklist = s.data[s.ip].Blacklist

	case strings.Join(models.FqdnFields, ","):
		data.Fqdn = s.data[s.ip].Fqdn
	case strings.Join(models.GeoFields, ","):
		data.Country = s.data[s.ip].Country
		data.CountryCode = s.data[s.ip].CountryCode
		data.Region = s.data[s.ip].Region
		data.City = s.data[s.ip].City
		data.Longitude = s.data[s.ip].Longitude
		data.Latitude = s.data[s.ip].Latitude
		data.Timezone = s.data[s.ip].Timezone
	case strings.Join(models.IspFields, ","):
		data.Isp = s.data[s.ip].Isp
		data.Organization = s.data[s.ip].Organization
	case strings.Join(models.LocalFields, ","):
		data.IsLocal = s.data[s.ip].IsLocal
	case strings.Join(models.OfficeFields, ","):
		data.IsOffice = s.data[s.ip].IsOffice
	case strings.Join(models.TorOrProxyFields, ","):
		data.TorExitNode = s.data[s.ip].TorExitNode
		data.ProxyOrVpn = s.data[s.ip].ProxyOrVpn
	}
	return nil
}

func (s *DataSetterMock) GetIP() string {
	return s.ip
}

func (s *DataSetterMock) Error() error {
	return s.err
}

type FetcherMock struct {
	data    map[string]dto.GetIPInfoOut
	timeout time.Duration
	fields  []string
	error   error
}

func (g *FetcherMock) Fields() []string {
	return g.fields
}

func (g *FetcherMock) Fetch(ctx context.Context, ips []string, ch chan<- setters.Setter) {
	if g.timeout != 0 {
		time.Sleep(g.timeout)
	}

	for _, ip := range ips {
		setter := &DataSetterMock{
			ip:     ip,
			err:    g.error,
			data:   g.data,
			fields: g.fields,
		}

		ch <- setter
	}
}

type CacheMock struct {
	mock.Mock
}

func (c *CacheMock) Get(ctx context.Context, ip net.IP, include, exclude []string) (dto.GetIPInfoOut, bool) {
	res := c.Called(ctx, ip, include, exclude)
	if res.Bool(1) {
		return res.Get(0).(dto.GetIPInfoOut), res.Bool(1)
	}
	return dto.GetIPInfoOut{}, res.Bool(1)
}

func (c *CacheMock) Set(ctx context.Context, ip net.IP, include, exclude []string, out dto.GetIPInfoOut) error {
	err := c.Called(ctx, ip, include, exclude, out)
	return err.Error(0)
}

func TestGetByIP_(t *testing.T) {
	testCases := []struct {
		name string

		ip      string
		include []string
		exclude []string

		geoInfoGetterNames  []string
		geoInfoGetterResult dto.GetIPInfoOut
		geoInfoGetterErr    error

		ispInfoGetterNames  []string
		ispInfoGetterResult dto.GetIPInfoOut
		ispInfoGetterErr    error

		fqdnGetterNames  []string
		fqdnGetterResult dto.GetIPInfoOut
		fqdnGetterErr    error

		officeCheckerNames  []string
		officeCheckerResult dto.GetIPInfoOut
		officeCheckerErr    error

		localCheckerNames  []string
		localCheckerResult dto.GetIPInfoOut
		localCheckerErr    error

		whiteOrBlackListCheckerNames  []string
		whiteOrBlackListCheckerResult dto.GetIPInfoOut
		whiteOrBlackListCheckerErr    error

		torOrProxyCheckNames  []string
		torOrProxyCheckResult dto.GetIPInfoOut
		torOrProxyCheckErr    error

		setCache   bool
		cacheValue dto.GetIPInfoOut

		expectIPInfo *dto.GetIPInfoOut
		expectErr    error
	}{
		{
			name: "includes all fields",
			ip:   "1.1.1.1",

			geoInfoGetterNames: models.GeoFields,
			geoInfoGetterResult: dto.GetIPInfoOut{
				City:    utilstests.CreateStringPointer("Miami"),
				Country: utilstests.CreateStringPointer("USA"),
			},

			ispInfoGetterNames: models.IspFields,
			ispInfoGetterResult: dto.GetIPInfoOut{
				Isp: utilstests.CreateStringPointer("result_isp"),
			},

			torOrProxyCheckNames: models.TorOrProxyFields,
			torOrProxyCheckResult: dto.GetIPInfoOut{
				ProxyOrVpn:  &utilstests.ValueTrue,
				TorExitNode: &utilstests.ValueTrue,
			},

			setCache: true,

			expectIPInfo: &dto.GetIPInfoOut{
				Ip:          "1.1.1.1",
				Country:     utilstests.CreateStringPointer("USA"),
				City:        utilstests.CreateStringPointer("Miami"),
				Isp:         utilstests.CreateStringPointer("result_isp"),
				TorExitNode: &utilstests.ValueTrue,
				ProxyOrVpn:  &utilstests.ValueTrue,
			},
		},
		{
			name: "includes all fields with array getter",
			ip:   "1.1.1.1",

			geoInfoGetterNames: models.GeoFields,
			geoInfoGetterResult: dto.GetIPInfoOut{
				City:    utilstests.CreateStringPointer("Miami"),
				Country: utilstests.CreateStringPointer("USA"),
			},

			ispInfoGetterNames: models.IspFields,
			ispInfoGetterResult: dto.GetIPInfoOut{
				Isp: utilstests.CreateStringPointer("result_isp"),
			},

			torOrProxyCheckNames: models.TorOrProxyFields,
			torOrProxyCheckResult: dto.GetIPInfoOut{
				ProxyOrVpn:  &utilstests.ValueTrue,
				TorExitNode: &utilstests.ValueTrue,
			},

			setCache: true,

			expectIPInfo: &dto.GetIPInfoOut{
				Ip:          "1.1.1.1",
				Country:     utilstests.CreateStringPointer("USA"),
				City:        utilstests.CreateStringPointer("Miami"),
				Isp:         utilstests.CreateStringPointer("result_isp"),
				TorExitNode: &utilstests.ValueTrue,
				ProxyOrVpn:  &utilstests.ValueTrue,
			},
		},
		{
			name:    "includes only field (isLocal)",
			ip:      "1.1.1.1",
			include: []string{"isLocal", "isOffice"},

			localCheckerResult: dto.GetIPInfoOut{
				IsLocal: &utilstests.ValueTrue,
			},
			localCheckerNames: models.LocalFields,

			officeCheckerResult: dto.GetIPInfoOut{
				IsOffice: &utilstests.ValueTrue,
			},
			officeCheckerNames: models.OfficeFields,

			setCache: true,

			expectIPInfo: &dto.GetIPInfoOut{
				Ip:       "1.1.1.1",
				IsLocal:  &utilstests.ValueTrue,
				IsOffice: &utilstests.ValueTrue,
			},
		},
		{
			name:    "includes isLocal and isOffice",
			ip:      "1.1.1.1",
			include: []string{"isLocal", "isOffice"},

			localCheckerResult: dto.GetIPInfoOut{
				IsLocal: &utilstests.ValueTrue,
			},
			localCheckerNames: models.LocalFields,

			officeCheckerResult: dto.GetIPInfoOut{
				IsOffice: &utilstests.ValueTrue,
			},
			officeCheckerNames: models.OfficeFields,

			setCache: true,

			expectIPInfo: &dto.GetIPInfoOut{
				Ip:       "1.1.1.1",
				IsLocal:  &utilstests.ValueTrue,
				IsOffice: &utilstests.ValueTrue,
			},
		},

		{
			name:    "includes only isp_info field (isp)",
			ip:      "1.1.1.1",
			include: []string{"isp"},

			geoInfoGetterResult: dto.GetIPInfoOut{
				City:    utilstests.CreateStringPointer("Miami"),
				Country: utilstests.CreateStringPointer("USA"),
			},
			geoInfoGetterNames: models.GeoFields,

			ispInfoGetterResult: dto.GetIPInfoOut{
				Isp: utilstests.CreateStringPointer("result_isp"),
			},
			ispInfoGetterNames: models.IspFields,

			officeCheckerResult: dto.GetIPInfoOut{
				IsOffice: &utilstests.ValueTrue,
			},
			officeCheckerNames: models.OfficeFields,
			setCache:           true,

			expectIPInfo: &dto.GetIPInfoOut{
				Ip:  "1.1.1.1",
				Isp: utilstests.CreateStringPointer("result_isp"),
			},
		},
		{
			name:    "includes city and exclude something (isLocal)",
			ip:      "1.1.1.1",
			include: []string{"city"},
			exclude: []string{"isLocal"},

			geoInfoGetterResult: dto.GetIPInfoOut{
				City:    utilstests.CreateStringPointer("Miami"),
				Country: utilstests.CreateStringPointer("USA"),
			},
			geoInfoGetterNames: models.GeoFields,

			officeCheckerResult: dto.GetIPInfoOut{
				IsOffice: &utilstests.ValueTrue,
			},
			officeCheckerNames: models.OfficeFields,

			setCache: true,
			expectIPInfo: &dto.GetIPInfoOut{
				Ip:      "1.1.1.1",
				City:    utilstests.CreateStringPointer("Miami"),
				Country: utilstests.CreateStringPointer("USA"),
			},
		},

		{
			name:    "exclude all isp field",
			ip:      "1.1.1.1",
			exclude: []string{"isp", "organization"},

			geoInfoGetterResult: dto.GetIPInfoOut{
				City:    utilstests.CreateStringPointer("Miami"),
				Country: utilstests.CreateStringPointer("USA"),
			},
			geoInfoGetterNames: models.GeoFields,

			ispInfoGetterResult: dto.GetIPInfoOut{
				Isp:          utilstests.CreateStringPointer("result_isp"),
				Organization: utilstests.CreateStringPointer("org"),
			},
			ispInfoGetterNames: models.IspFields,

			torOrProxyCheckResult: dto.GetIPInfoOut{
				ProxyOrVpn:  &utilstests.ValueTrue,
				TorExitNode: &utilstests.ValueTrue,
			},
			torOrProxyCheckNames: models.TorOrProxyFields,

			setCache: true,

			expectIPInfo: &dto.GetIPInfoOut{
				Ip:          "1.1.1.1",
				City:        utilstests.CreateStringPointer("Miami"),
				Country:     utilstests.CreateStringPointer("USA"),
				TorExitNode: &utilstests.ValueTrue,
				ProxyOrVpn:  &utilstests.ValueTrue,
			},
		},

		{
			name:    "exclude geoinfo fields and proxy and tor",
			ip:      "1.1.1.1",
			exclude: append(models.TorOrProxyFields, models.GeoFields...),

			geoInfoGetterResult: dto.GetIPInfoOut{
				City:    utilstests.CreateStringPointer("Miami"),
				Country: utilstests.CreateStringPointer("USA"),
			},
			geoInfoGetterNames: models.GeoFields,

			ispInfoGetterResult: dto.GetIPInfoOut{
				Isp: utilstests.CreateStringPointer("result_isp"),
			},
			ispInfoGetterNames: models.IspFields,

			torOrProxyCheckResult: dto.GetIPInfoOut{
				ProxyOrVpn:  &utilstests.ValueTrue,
				TorExitNode: &utilstests.ValueTrue,
			},
			torOrProxyCheckNames: models.TorOrProxyFields,

			setCache: true,

			expectIPInfo: &dto.GetIPInfoOut{
				Ip:  "1.1.1.1",
				Isp: utilstests.CreateStringPointer("result_isp"),
			},
		},
		{
			name:    "with error from getter",
			ip:      "1.1.1.1",
			exclude: []string{"city", "proxyOrVpn"},

			geoInfoGetterErr:   ErrTest,
			geoInfoGetterNames: models.GeoFields,

			expectIPInfo: &dto.GetIPInfoOut{
				Ip: "1.1.1.1",
			},
		},
		{
			name: "with error from getter and with result another",
			ip:   "1.1.1.1",

			geoInfoGetterErr:   ErrTest,
			geoInfoGetterNames: models.GeoFields,
			torOrProxyCheckResult: dto.GetIPInfoOut{
				ProxyOrVpn:  &utilstests.ValueTrue,
				TorExitNode: &utilstests.ValueFalse,
			},
			torOrProxyCheckNames: models.TorOrProxyFields,

			expectIPInfo: &dto.GetIPInfoOut{
				Ip:          "1.1.1.1",
				TorExitNode: &utilstests.ValueFalse,
				ProxyOrVpn:  &utilstests.ValueTrue,
			},
		},
		{
			name: "with cache all fields",
			ip:   "1.1.1.1",
			cacheValue: dto.GetIPInfoOut{
				Ip:           "1.1.1.1",
				IsLocal:      &utilstests.ValueTrue,
				Organization: utilstests.CreateStringPointer("org"),
				City:         utilstests.CreateStringPointer("Samara"),
				Fqdn:         utilstests.CreateStringPointer("fqdn"),
				IsOffice:     &utilstests.ValueTrue,
				Longitude:    utilstests.CreateFloatPointer(34),
			},
			expectIPInfo: &dto.GetIPInfoOut{
				Ip:           "1.1.1.1",
				IsLocal:      &utilstests.ValueTrue,
				Organization: utilstests.CreateStringPointer("org"),
				City:         utilstests.CreateStringPointer("Samara"),
				Fqdn:         utilstests.CreateStringPointer("fqdn"),
				IsOffice:     &utilstests.ValueTrue,
				Longitude:    utilstests.CreateFloatPointer(34),
			},
		},
		{
			name:    "with cache with include",
			ip:      "1.1.1.1",
			include: []string{"city", "fqdn"},
			cacheValue: dto.GetIPInfoOut{
				Ip:       "1.1.1.1",
				City:     utilstests.CreateStringPointer("Samara"),
				IsOffice: &utilstests.ValueFalse,
				Isp:      utilstests.CreateStringPointer("isp"),
				IsLocal:  &utilstests.ValueTrue,
				Fqdn:     utilstests.CreateStringPointer("fqdn"),
			},
			expectIPInfo: &dto.GetIPInfoOut{
				Ip:   "1.1.1.1",
				City: utilstests.CreateStringPointer("Samara"),
				Fqdn: utilstests.CreateStringPointer("fqdn"),
			},
		},
		{
			name:    "with cache with exclude all geo fields",
			ip:      "1.1.1.1",
			exclude: models.GeoFields,
			cacheValue: dto.GetIPInfoOut{
				Ip:       "1.1.1.1",
				City:     utilstests.CreateStringPointer("Samara"),
				IsOffice: &utilstests.ValueFalse,
				Isp:      utilstests.CreateStringPointer("isp"),
				IsLocal:  &utilstests.ValueTrue,
				Fqdn:     utilstests.CreateStringPointer("fqdn"),
			},
			expectIPInfo: &dto.GetIPInfoOut{
				Ip:       "1.1.1.1",
				IsOffice: &utilstests.ValueFalse,
				Isp:      utilstests.CreateStringPointer("isp"),
				IsLocal:  &utilstests.ValueTrue,
				Fqdn:     utilstests.CreateStringPointer("fqdn"),
			},
		},
		{
			name:      "ip ip not validate",
			ip:        "1.i.1.1",
			expectErr: aggregator.ErrValidateIP,
		},
	}

	for _, c := range testCases {
		c := c
		t.Run(c.name, func(t *testing.T) {
			torOrProxyCheck := &FetcherMock{
				data: map[string]dto.GetIPInfoOut{
					c.ip: {
						TorExitNode: c.torOrProxyCheckResult.TorExitNode,
						ProxyOrVpn:  c.torOrProxyCheckResult.ProxyOrVpn,
					},
				},
				fields: c.torOrProxyCheckNames,
				error:  c.torOrProxyCheckErr,
			}

			officeChecker := &FetcherMock{
				data: map[string]dto.GetIPInfoOut{
					c.ip: {
						IsOffice: c.officeCheckerResult.IsOffice,
					},
				},
				fields: c.officeCheckerNames,
				error:  c.officeCheckerErr,
			}

			localChecker := &FetcherMock{
				data: map[string]dto.GetIPInfoOut{
					c.ip: {
						IsLocal: c.localCheckerResult.IsLocal,
					},
				},
				fields: c.localCheckerNames,
				error:  c.localCheckerErr,
			}

			whiteOrBlackListChecker := &FetcherMock{
				data: map[string]dto.GetIPInfoOut{
					c.ip: {
						Whitelist: c.whiteOrBlackListCheckerResult.Whitelist,
						Blacklist: c.whiteOrBlackListCheckerResult.Blacklist,
					},
				},
				fields: c.whiteOrBlackListCheckerNames,
				error:  c.whiteOrBlackListCheckerErr,
			}

			ispInfoGetter := &FetcherMock{
				data: map[string]dto.GetIPInfoOut{
					c.ip: {
						Isp:          c.ispInfoGetterResult.Isp,
						Organization: c.ispInfoGetterResult.Organization,
					},
				},
				fields: c.ispInfoGetterNames,
				error:  c.ispInfoGetterErr,
			}

			geoInfoGetter := &FetcherMock{
				data: map[string]dto.GetIPInfoOut{
					c.ip: {
						Country:     c.geoInfoGetterResult.Country,
						CountryCode: c.geoInfoGetterResult.CountryCode,
						Region:      c.geoInfoGetterResult.Region,
						City:        c.geoInfoGetterResult.City,
						Longitude:   c.geoInfoGetterResult.Longitude,
						Latitude:    c.geoInfoGetterResult.Latitude,
						Timezone:    c.geoInfoGetterResult.Timezone,
					},
				},
				fields: c.geoInfoGetterNames,
				error:  c.geoInfoGetterErr,
			}

			fqdnGetter := &FetcherMock{
				data: map[string]dto.GetIPInfoOut{
					c.ip: {
						Fqdn: c.fqdnGetterResult.Fqdn,
					},
				},
				fields: c.fqdnGetterNames,
				error:  c.fqdnGetterErr,
			}

			getters := []aggregator.DataFetcher{
				torOrProxyCheck,
				officeChecker,
				localChecker,
				ispInfoGetter,
				geoInfoGetter,
				fqdnGetter,
				whiteOrBlackListChecker,
			}

			log, err := logger.New()
			require.NoError(t, err)

			cache := new(CacheMock)
			cache.On("Get", mock.Anything, net.ParseIP(c.ip), c.include, c.exclude).
				Return(c.cacheValue, c.cacheValue != dto.GetIPInfoOut{})
			if c.setCache {
				cache.On("Set", mock.Anything, net.ParseIP(c.ip), c.include, c.exclude, *c.expectIPInfo).Return(nil)
			}

			collection := models.DefaultCollectionFields()
			deps := &aggregator.IPInfoAggregatorDeps{
				Cache:      cache,
				Fetcher:    getters,
				Collection: collection,
				Log:        log,
			}
			getterIPInfo := aggregator.NewIPInfoAggregator(deps)
			actualIPInfo, actualErr := getterIPInfo.GetByIP(context.Background(), c.ip, c.include, c.exclude)
			if actualErr != nil {
				assert.Contains(t, c.expectErr.Error(), errors.Cause(actualErr).Error())
			} else {
				assert.NoError(t, actualErr)
			}
			assert.Equal(t, c.expectIPInfo, actualIPInfo)

			cacheAssertNumberOfCallsGet := 0
			if net.ParseIP(c.ip) != nil {
				cacheAssertNumberOfCallsGet = 1
			}
			cache.AssertNumberOfCalls(t, "Get", cacheAssertNumberOfCallsGet)
			if c.setCache {
				cache.AssertNumberOfCalls(t, "Set", 1)
			}
		})
	}
}

func TestGetByIPs_(t *testing.T) {
	testCases := []struct {
		name string

		ips     []string
		include []string
		exclude []string

		geoInfoGetterNames  []string
		geoInfoGetterResult map[string]dto.GetIPInfoOut
		geoInfoGetterErr    error

		ispInfoGetterNames  []string
		ispInfoGetterResult map[string]dto.GetIPInfoOut
		ispInfoGetterErr    error

		fqdnGetterNames  []string
		fqdnGetterResult map[string]dto.GetIPInfoOut
		fqdnGetterErr    error

		officeCheckerNames  []string
		officeCheckerResult map[string]dto.GetIPInfoOut
		officeCheckerErr    error

		localCheckerNames  []string
		localCheckerResult map[string]dto.GetIPInfoOut
		localCheckerErr    error

		whiteOrBlackListCheckerNames  []string
		whiteOrBlackListCheckerResult map[string]dto.GetIPInfoOut
		whiteOrBlackListCheckerErr    error

		torOrProxyCheckNames  []string
		torOrProxyCheckResult map[string]dto.GetIPInfoOut
		torOrProxyCheckErr    error

		cacheValue   dto.GetIPInfoOut
		expectIPInfo *dto.GetIPsInfoOut
		wantErr      bool
	}{
		{
			name: "success",
			ips:  []string{"1.1.1.1"},

			geoInfoGetterResult: map[string]dto.GetIPInfoOut{
				"1.1.1.1": {
					City:    utilstests.CreateStringPointer("Miami"),
					Country: utilstests.CreateStringPointer("USA"),
				},
			},
			geoInfoGetterNames: models.GeoFields,

			ispInfoGetterNames: models.IspFields,
			ispInfoGetterResult: map[string]dto.GetIPInfoOut{
				"1.1.1.1": {
					Isp: utilstests.CreateStringPointer("result_isp"),
				},
			},

			torOrProxyCheckNames: models.TorOrProxyFields,
			torOrProxyCheckResult: map[string]dto.GetIPInfoOut{
				"1.1.1.1": {
					ProxyOrVpn:  &utilstests.ValueTrue,
					TorExitNode: &utilstests.ValueTrue,
				},
			},

			expectIPInfo: &dto.GetIPsInfoOut{
				Result: map[string]dto.GetIPInfoOut{
					"1.1.1.1": {
						Ip:          "1.1.1.1",
						Country:     utilstests.CreateStringPointer("USA"),
						City:        utilstests.CreateStringPointer("Miami"),
						Isp:         utilstests.CreateStringPointer("result_isp"),
						TorExitNode: &utilstests.ValueTrue,
						ProxyOrVpn:  &utilstests.ValueTrue,
					},
				},
			},
		},
		{
			name: "with error from getter by netIP",
			ips:  []string{"1.1.1.1"},

			geoInfoGetterErr: ErrTest,
			expectIPInfo: &dto.GetIPsInfoOut{
				Result: map[string]dto.GetIPInfoOut{},
			},
		},
		{
			name:    "success with exclude and with include",
			ips:     []string{"1.1.1.1"},
			exclude: []string{"isLocal"},
			include: []string{"city"},

			geoInfoGetterResult: map[string]dto.GetIPInfoOut{
				"1.1.1.1": {
					City:    utilstests.CreateStringPointer("Miami"),
					Country: utilstests.CreateStringPointer("USA"),
				},
			},
			geoInfoGetterNames: models.GeoFields,

			ispInfoGetterNames: models.IspFields,
			ispInfoGetterResult: map[string]dto.GetIPInfoOut{
				"1.1.1.1": {
					Isp: utilstests.CreateStringPointer("result_isp"),
				},
			},

			torOrProxyCheckNames: models.TorOrProxyFields,
			torOrProxyCheckResult: map[string]dto.GetIPInfoOut{
				"1.1.1.1": {
					ProxyOrVpn:  &utilstests.ValueTrue,
					TorExitNode: &utilstests.ValueTrue,
				},
			},

			expectIPInfo: &dto.GetIPsInfoOut{
				Result: map[string]dto.GetIPInfoOut{
					"1.1.1.1": {
						Ip:      "1.1.1.1",
						City:    utilstests.CreateStringPointer("Miami"),
						Country: utilstests.CreateStringPointer("USA"),
					},
				},
			},
		},
		{
			name: "with error from getter by array",
			ips:  []string{"1.1.1.1"},

			geoInfoGetterErr: ErrTest,
			expectIPInfo: &dto.GetIPsInfoOut{
				Result: map[string]dto.GetIPInfoOut{},
			},
		},
		{
			name:    "with cache",
			ips:     []string{"1.1.1.1"},
			include: []string{"fqdn", "isLocal"},
			cacheValue: dto.GetIPInfoOut{
				Ip:      "1.1.1.1",
				IsLocal: &utilstests.ValueTrue,
				Fqdn:    utilstests.CreateStringPointer("fqdn"),
			},
			expectIPInfo: &dto.GetIPsInfoOut{
				Result: map[string]dto.GetIPInfoOut{
					"1.1.1.1": {
						Ip:      "1.1.1.1",
						IsLocal: &utilstests.ValueTrue,
						Fqdn:    utilstests.CreateStringPointer("fqdn"),
					},
				},
			},
		},
		{
			name: "success getter where two getter (by netIP and by array) with equally names",
			ips:  []string{"1.1.1.1"},

			geoInfoGetterResult: map[string]dto.GetIPInfoOut{
				"1.1.1.1": {
					City:    utilstests.CreateStringPointer("Miami"),
					Country: utilstests.CreateStringPointer("USA"),
				},
			},

			geoInfoGetterNames: models.GeoFields,

			ispInfoGetterNames: models.IspFields,
			ispInfoGetterResult: map[string]dto.GetIPInfoOut{
				"1.1.1.1": {
					Isp: utilstests.CreateStringPointer("result_isp"),
				},
			},

			torOrProxyCheckNames: models.TorOrProxyFields,
			torOrProxyCheckResult: map[string]dto.GetIPInfoOut{
				"1.1.1.1": {
					ProxyOrVpn:  &utilstests.ValueTrue,
					TorExitNode: &utilstests.ValueTrue,
				},
			},
			expectIPInfo: &dto.GetIPsInfoOut{
				Result: map[string]dto.GetIPInfoOut{
					"1.1.1.1": {
						Ip:          "1.1.1.1",
						Country:     utilstests.CreateStringPointer("USA"),
						City:        utilstests.CreateStringPointer("Miami"),
						Isp:         utilstests.CreateStringPointer("result_isp"),
						TorExitNode: &utilstests.ValueTrue,
						ProxyOrVpn:  &utilstests.ValueTrue,
					},
				},
			},
		},
		{
			name: "where some fetchers and getter by array error",
			ips:  []string{"1.1.1.1"},

			geoInfoGetterErr:   ErrTest,
			ispInfoGetterNames: models.IspFields,
			ispInfoGetterResult: map[string]dto.GetIPInfoOut{
				"1.1.1.1": {Isp: utilstests.CreateStringPointer("result_isp")},
			},

			torOrProxyCheckNames: models.TorOrProxyFields,
			torOrProxyCheckResult: map[string]dto.GetIPInfoOut{
				"1.1.1.1": {
					ProxyOrVpn:  &utilstests.ValueTrue,
					TorExitNode: &utilstests.ValueTrue,
				},
			},
			expectIPInfo: &dto.GetIPsInfoOut{
				Result: map[string]dto.GetIPInfoOut{
					"1.1.1.1": {
						Ip:          "1.1.1.1",
						Isp:         utilstests.CreateStringPointer("result_isp"),
						TorExitNode: &utilstests.ValueTrue,
						ProxyOrVpn:  &utilstests.ValueTrue,
					},
				},
			},
		},
		{
			name: "where some fetchers and getter by netIP error",
			ips:  []string{"1.1.1.1"},

			geoInfoGetterResult: map[string]dto.GetIPInfoOut{
				"1.1.1.1": {
					City:    utilstests.CreateStringPointer("Miami"),
					Country: utilstests.CreateStringPointer("USA"),
				},
			},
			geoInfoGetterNames: models.GeoFields,

			ispInfoGetterNames: models.IspFields,
			ispInfoGetterResult: map[string]dto.GetIPInfoOut{
				"1.1.1.1": {
					Isp: utilstests.CreateStringPointer("result_isp"),
				},
			},

			torOrProxyCheckNames: models.TorOrProxyFields,
			torOrProxyCheckErr:   ErrTest,
			expectIPInfo: &dto.GetIPsInfoOut{
				Result: map[string]dto.GetIPInfoOut{
					"1.1.1.1": {
						Ip:      "1.1.1.1",
						Country: utilstests.CreateStringPointer("USA"),
						City:    utilstests.CreateStringPointer("Miami"),
						Isp:     utilstests.CreateStringPointer("result_isp"),
					},
				},
			},
		},
		{
			name: "ips many",
			ips:  []string{"1.1.1.1", "2.2.2.2"},

			geoInfoGetterResult: map[string]dto.GetIPInfoOut{
				"1.1.1.1": {
					City:    utilstests.CreateStringPointer("Miami"),
					Country: utilstests.CreateStringPointer("USA"),
				},
				"2.2.2.2": {
					City:    utilstests.CreateStringPointer("Miami1"),
					Country: utilstests.CreateStringPointer("USA1"),
				},
			},
			geoInfoGetterNames: models.GeoFields,

			ispInfoGetterNames: models.IspFields,
			ispInfoGetterResult: map[string]dto.GetIPInfoOut{
				"1.1.1.1": {
					Isp: utilstests.CreateStringPointer("result_isp"),
				},
			},

			torOrProxyCheckNames: models.TorOrProxyFields,
			torOrProxyCheckResult: map[string]dto.GetIPInfoOut{
				"1.1.1.1": {
					ProxyOrVpn:  &utilstests.ValueTrue,
					TorExitNode: &utilstests.ValueTrue,
				},
			},

			expectIPInfo: &dto.GetIPsInfoOut{
				Result: map[string]dto.GetIPInfoOut{
					"1.1.1.1": {
						Ip:          "1.1.1.1",
						Country:     utilstests.CreateStringPointer("USA"),
						City:        utilstests.CreateStringPointer("Miami"),
						Isp:         utilstests.CreateStringPointer("result_isp"),
						TorExitNode: &utilstests.ValueTrue,
						ProxyOrVpn:  &utilstests.ValueTrue,
					},
					"2.2.2.2": {
						Ip:      "2.2.2.2",
						Country: utilstests.CreateStringPointer("USA1"),
						City:    utilstests.CreateStringPointer("Miami1"),
					},
				},
			},
		},
		{
			name: "ips many - one not validate",
			ips:  []string{"1.1.1.1", "2.i.2.2"},

			geoInfoGetterResult: map[string]dto.GetIPInfoOut{
				"1.1.1.1": {
					City:    utilstests.CreateStringPointer("Miami"),
					Country: utilstests.CreateStringPointer("USA"),
				},
				"2.2.2.2": {
					City:    utilstests.CreateStringPointer("Miami1"),
					Country: utilstests.CreateStringPointer("USA1"),
				},
			},
			geoInfoGetterNames: models.GeoFields,

			ispInfoGetterNames: models.IspFields,
			ispInfoGetterResult: map[string]dto.GetIPInfoOut{
				"1.1.1.1": {
					Isp: utilstests.CreateStringPointer("result_isp"),
				},
			},

			torOrProxyCheckNames: models.TorOrProxyFields,
			torOrProxyCheckResult: map[string]dto.GetIPInfoOut{
				"1.1.1.1": {
					ProxyOrVpn:  &utilstests.ValueTrue,
					TorExitNode: &utilstests.ValueTrue,
				},
			},

			expectIPInfo: &dto.GetIPsInfoOut{
				Result: map[string]dto.GetIPInfoOut{
					"1.1.1.1": {
						Ip:          "1.1.1.1",
						Country:     utilstests.CreateStringPointer("USA"),
						City:        utilstests.CreateStringPointer("Miami"),
						Isp:         utilstests.CreateStringPointer("result_isp"),
						TorExitNode: &utilstests.ValueTrue,
						ProxyOrVpn:  &utilstests.ValueTrue,
					},
				},
			},
		},
	}

	for _, c := range testCases {
		c := c
		t.Run(c.name, func(t *testing.T) {
			var torOrProxyCheck, officeChecker, localChecker,
				whiteOrBlackListChecker, ispInfoGetter, geoInfoGetter, fqdnGetter *FetcherMock

			torOrProxyCheck = &FetcherMock{
				fields: c.torOrProxyCheckNames,
				error:  c.torOrProxyCheckErr,
				data:   make(map[string]dto.GetIPInfoOut),
			}

			officeChecker = &FetcherMock{
				fields: c.officeCheckerNames,
				error:  c.officeCheckerErr,
				data:   make(map[string]dto.GetIPInfoOut),
			}

			localChecker = &FetcherMock{
				fields: c.localCheckerNames,
				error:  c.localCheckerErr,
				data:   make(map[string]dto.GetIPInfoOut),
			}

			whiteOrBlackListChecker = &FetcherMock{
				fields: c.whiteOrBlackListCheckerNames,
				error:  c.whiteOrBlackListCheckerErr,
				data:   make(map[string]dto.GetIPInfoOut),
			}

			ispInfoGetter = &FetcherMock{
				fields: c.ispInfoGetterNames,
				error:  c.ispInfoGetterErr,
				data:   make(map[string]dto.GetIPInfoOut),
			}

			geoInfoGetter = &FetcherMock{
				fields: c.geoInfoGetterNames,
				error:  c.geoInfoGetterErr,
				data:   make(map[string]dto.GetIPInfoOut),
			}

			fqdnGetter = &FetcherMock{
				fields: c.fqdnGetterNames,
				error:  c.fqdnGetterErr,
				data:   make(map[string]dto.GetIPInfoOut),
			}

			for _, ip := range c.ips {
				torOrProxyCheck.data[ip] = dto.GetIPInfoOut{
					TorExitNode: c.torOrProxyCheckResult[ip].TorExitNode,
					ProxyOrVpn:  c.torOrProxyCheckResult[ip].ProxyOrVpn,
				}

				officeChecker.data[ip] = dto.GetIPInfoOut{
					IsOffice: c.officeCheckerResult[ip].IsOffice,
				}

				localChecker.data[ip] = dto.GetIPInfoOut{
					IsLocal: c.localCheckerResult[ip].IsLocal,
				}

				whiteOrBlackListChecker.data[ip] = dto.GetIPInfoOut{
					Whitelist: c.whiteOrBlackListCheckerResult[ip].Whitelist,
					Blacklist: c.whiteOrBlackListCheckerResult[ip].Blacklist,
				}

				ispInfoGetter.data[ip] = dto.GetIPInfoOut{
					Isp:          c.ispInfoGetterResult[ip].Isp,
					Organization: c.ispInfoGetterResult[ip].Organization,
				}

				geoInfoGetter.data[ip] = dto.GetIPInfoOut{
					Country:     c.geoInfoGetterResult[ip].Country,
					CountryCode: c.geoInfoGetterResult[ip].CountryCode,
					Region:      c.geoInfoGetterResult[ip].Region,
					City:        c.geoInfoGetterResult[ip].City,
					Longitude:   c.geoInfoGetterResult[ip].Longitude,
					Latitude:    c.geoInfoGetterResult[ip].Latitude,
					Timezone:    c.geoInfoGetterResult[ip].Timezone,
				}

				fqdnGetter.data[ip] = dto.GetIPInfoOut{
					Fqdn: c.fqdnGetterResult[ip].Fqdn,
				}
			}

			getters := []aggregator.DataFetcher{
				torOrProxyCheck,
				officeChecker,
				localChecker,
				ispInfoGetter,
				geoInfoGetter,
				fqdnGetter,
				whiteOrBlackListChecker,
			}

			log, err := logger.New()
			require.NoError(t, err)

			cache := new(CacheMock)
			for _, ip := range c.ips {
				cache.On("Get", mock.Anything, net.ParseIP(ip), c.include, c.exclude).
					Return(c.cacheValue, c.cacheValue != dto.GetIPInfoOut{})
				if !c.wantErr {
					cache.On("Set", mock.Anything, net.ParseIP(ip), c.include, c.exclude, c.expectIPInfo.Result[ip]).Return(nil)
				}
			}

			collection := models.DefaultCollectionFields()
			deps := &aggregator.IPInfoAggregatorDeps{
				Fetcher:    getters,
				Cache:      cache,
				Collection: collection,
				Log:        log,
			}
			getterIPInfo := aggregator.NewIPInfoAggregator(deps)
			actualIPInfo, actualErr := getterIPInfo.GetByIPs(context.Background(), c.ips, c.include, c.exclude)
			assert.Equal(t, c.wantErr, actualErr != nil)
			ok := reflect.DeepEqual(c.expectIPInfo, actualIPInfo)
			assert.True(t, ok)
			cacheAssertNumberOfCallsGet := 0
			for _, ip := range c.ips {
				ipNet := net.ParseIP(ip)
				if ipNet == nil {
					continue
				}
				cacheAssertNumberOfCallsGet++
			}
			cache.AssertNumberOfCalls(t, "Get", cacheAssertNumberOfCallsGet)
		})
	}
}

func TestGetByIPParallel(t *testing.T) {
	ip := "1.1.1.1"
	countGetter := 10
	timeoutGetter := time.Second

	namesNumber := [][]string{
		models.BlackOrWhitelistFields,
		models.FqdnFields,
		models.GeoFields,
		models.IspFields,
		models.LocalFields,
		models.OfficeFields,
		models.TorOrProxyFields,
	}
	rand.Seed(time.Now().UnixNano())
	getters := make([]aggregator.DataFetcher, countGetter)
	for i := 0; i < countGetter; i++ {
		getter := &FetcherMock{timeout: timeoutGetter}
		// nolint:gosec // достаточно math/rand пакета
		names := namesNumber[rand.Intn(len(namesNumber)-1)]
		getter.fields = names
		getters[i] = getter
	}

	log, err := logger.New()
	require.NoError(t, err)

	cache := new(CacheMock)
	cache.On("Get", mock.Anything, net.ParseIP(ip), []string{}, []string{}).
		Return(mock.Anything, false)
	cache.On("Set", mock.Anything, net.ParseIP(ip), mock.Anything, mock.Anything, mock.Anything).Return(nil)

	collection := models.DefaultCollectionFields()
	deps := &aggregator.IPInfoAggregatorDeps{
		Cache:      cache,
		Fetcher:    getters,
		Collection: collection,
		Log:        log,
	}
	defer goleak.VerifyNone(t)
	getterIPInfo := aggregator.NewIPInfoAggregator(deps)
	timeStart := time.Now()
	actualIPInfo, actualErr := getterIPInfo.GetByIP(context.Background(), ip, []string{}, []string{})
	expectTime := int(timeoutGetter.Seconds())
	actualTime := int(time.Since(timeStart).Seconds())
	assert.LessOrEqual(t, actualTime, expectTime)
	assert.NoError(t, actualErr)
	assert.NotNil(t, actualIPInfo)
}

func TestGetByIpsParallel(t *testing.T) {
	ips := []string{"1.6.1.6", "1.1.1.8", "1.8.8.1", "1.177.1.1", "100.1.1.1"}
	countGetters := 1000
	timeoutGetter := time.Second

	namesNumber := [][]string{
		models.BlackOrWhitelistFields,
		models.FqdnFields,
		models.GeoFields,
		models.IspFields,
		models.LocalFields,
		models.OfficeFields,
		models.TorOrProxyFields,
	}

	rand.Seed(time.Now().UnixNano())
	getters := make([]aggregator.DataFetcher, countGetters)
	for i := 0; i < countGetters; i++ {
		getter := &FetcherMock{timeout: timeoutGetter}
		// nolint:gosec // достаточно math/rand пакета
		names := namesNumber[rand.Intn(len(namesNumber)-1)]
		getter.fields = names
		getters[i] = getter
	}

	log, err := logger.New()
	require.NoError(t, err)

	cache := new(CacheMock)
	for _, ip := range ips {
		cache.On("Get", mock.Anything, net.ParseIP(ip), []string{}, []string{}).
			Return(mock.Anything, false)
		cache.On("Set", mock.Anything, net.ParseIP(ip), mock.Anything, mock.Anything, mock.Anything).Return(nil)
	}

	collection := models.DefaultCollectionFields()
	deps := &aggregator.IPInfoAggregatorDeps{
		Cache:      cache,
		Fetcher:    getters,
		Collection: collection,
		Log:        log,
	}
	defer goleak.VerifyNone(t)
	getterIPInfo := aggregator.NewIPInfoAggregator(deps)
	timeStart := time.Now()
	actualIPInfo, actualErr := getterIPInfo.GetByIPs(context.Background(), ips, []string{}, []string{})
	expectTime := int(timeoutGetter.Seconds() * 2)
	actualTime := int(time.Since(timeStart).Seconds())
	assert.LessOrEqual(t, actualTime, expectTime)
	assert.NoError(t, actualErr)
	assert.NotNil(t, actualIPInfo)
}