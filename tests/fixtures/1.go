package main

import (
	"fmt"
	"net/http"
	"os"
	"path"
	"strings"

	"github.com/furdarius/jwtee"
	"github.com/furdarius/jwtee/signer"
	"github.com/justinas/alice"
	"github.com/nlopes/slack"
	"github.com/rs/cors"
	"github.com/rs/zerolog/hlog"
	apiRouter "go.example.com/av/api-composition-schema/router"
	baseHTTP "go.example.com/comn/go-http-client"
	"go.example.com/gl/core/clients"
	configLoader "go.example.com/gl/core/config"
	baseHandlers "go.example.com/gl/core/handlers"
	"go.example.com/gl/core/validate"
	"go.example.com/gl/env2conf"
	"go.example.com/gl/info"
	protocol "go.example.com/gl/json-http-protocol"
	"go.example.com/gl/metrics/v3"
	service_item_client "go.example.com/gl/service-item-client"
	msgclient "go.example.com/gl/service-messenger-client"
	phones "go.example.com/gl/service-phones-client"
	"go.example.com/gl/stats"
	userProfile "go.example.com/gl/user-profile-client"
	"go.example.com/msg/go-messenger-platform-client/client"
	"go.example.com/str/auth"
	"gopkg.in/alexcesaro/statsd.v2"

	"go.example.com/sd/better/metadata"
	"go.example.com/sd/better/middleware"
	"go.example.com/sd/better/twirtr"
	mplaceV2 "go.example.com/sd/mplacev2-go-str"
	"go.example.com/sd/service-one-two/internal/api"
	getRealtyBookings "go.example.com/sd/service-one-two/internal/api/handler/get_realty_bookings"
	postRealtyPrices "go.example.com/sd/service-one-two/internal/api/handler/post_realty_prices"
	putBookingsInfo "go.example.com/sd/service-one-two/internal/api/handler/put_bookings_info"
	middlewares "go.example.com/sd/service-one-two/internal/api/middleware"
	"go.example.com/sd/service-one-two/internal/clients/activator"
	"go.example.com/sd/service-one-two/internal/clients/deal"
	"go.example.com/sd/service-one-two/internal/clients/helpdesk"
	"go.example.com/sd/service-one-two/internal/clients/marketplace"
	"go.example.com/sd/service-one-two/internal/config"
	getRealtyBookingsHandle "go.example.com/sd/service-one-two/internal/generated/api/schema/get_realty_bookings"
	postRealtyPricesHandle "go.example.com/sd/service-one-two/internal/generated/api/schema/post_realty_prices"
	putBookingsInfoHandle "go.example.com/sd/service-one-two/internal/generated/api/schema/put_bookings_info"
	"go.example.com/sd/service-one-two/internal/generated/rpc/clients/str_activator"
	"go.example.com/sd/service-one-two/internal/generated/rpc/clients/str_prices"
	"go.example.com/sd/service-one-two/internal/generated/rpc/service"
	server "go.example.com/sd/service-one-two/internal/http"
	customMiddleware "go.example.com/sd/service-one-two/internal/http/middleware"
	"go.example.com/sd/service-one-two/internal/jsonrpc"
	"go.example.com/sd/service-one-two/internal/messenger"
	"go.example.com/sd/service-one-two/internal/mobile"
	payoutserverV1 "go.example.com/sd/service-one-two/internal/payoutserver/v1"
	"go.example.com/sd/service-one-two/internal/router"
	"go.example.com/sd/service-one-two/internal/rpc/items_info"
	"go.example.com/sd/service-one-two/internal/rpchandlers"
	"go.example.com/sd/service-one-two/internal/rpchandlers/calendars"
	"go.example.com/sd/service-one-two/internal/seller"
	"go.example.com/sd/service-one-two/internal/services/book"
	"go.example.com/sd/service-one-two/internal/services/booking"
	"go.example.com/sd/service-one-two/internal/services/bookingability"
	"go.example.com/sd/service-one-two/internal/services/bubbles"
	"go.example.com/sd/service-one-two/internal/services/intervals"
	"go.example.com/sd/service-one-two/internal/services/oasis"
	payoutserviceV1 "go.example.com/sd/service-one-two/internal/services/payout/v1"
	"go.example.com/sd/service-one-two/internal/services/restrictions"
	"go.example.com/sd/service-one-two/internal/slacknotifier"
	payoutrpcV1 "go.example.com/sd/service-one-two/rpc/payout/v1"
	inventory "go.example.com/sd/service-str-inventory/pkg/client"
	inventoryBaseV1 "go.example.com/sd/service-str-inventory/rpc/base/v1"
	inventoryInvV1 "go.example.com/sd/service-str-inventory/rpc/inventory/v1"
)

func main() {
	log := buildLogger()

	cfg := config.New()
	err := env2conf.ConfigFromEnv(cfg)

	// TODO: Replace with ENV configuration
	err = configLoader.LoadFromFile(os.Getenv("CONFIG_PATH"), &cfg)
	if err != nil {
		log.Fatal().Err(err).
			Msg("failed to load config from file")
	}

	statsdAddr := fmt.Sprintf("%v:%v", cfg.Statsd.Host, cfg.Statsd.Port)
	statsdCl, err := statsd.New(
		statsd.Address(statsdAddr),
		statsd.Prefix(cfg.Statsd.Prefix),
		statsd.Network(cfg.Statsd.Protocol),
		statsd.Mute(!cfg.Statsd.Enable))
	if err != nil {
		log.Fatal().Err(err).
			Str("address", statsdAddr).
			Str("protocol", cfg.Statsd.Protocol).
			Msg("failed to ping statsd endpoint")
	}
	defer statsdCl.Close()

	statsCl := stats.NewStatsdProvider(statsdCl)
	defer statsCl.Flush()

	rpcStatsCl := statsCl.Prefix("rpc_rtt")

	validateFactory := validate.NewValidateFactoryByPath(cfg.Validator.Path, false)

	activatorTransport := clients.NewHTTPClient(cfg.Clients.StrActivator.Timeout, cfg.Clients.StrActivator.MaxIdleConns)
	activatorCl := activator.NewHTTPClient(activatorTransport, cfg.Clients.StrActivator.URL)

	dealTransport := clients.NewHTTPClient(cfg.Clients.StrDeal.Timeout, cfg.Clients.StrDeal.MaxIdleConns)
	dealCl := deal.NewHTTPClient(dealTransport, cfg.Clients.StrDeal.URL)

	pricesProtocol, err := protocol.New(
		"str-prices",
		protocol.BaseURL(cfg.Clients.StrPrices.URL),
	)
	if err != nil {
		log.Fatal().Err(err).Msg("Failed to initiate str-prices client")
	}
	pricesCl := str_prices.New(pricesProtocol)

	activatorProtocol, err := protocol.New(
		"str-activator",
		protocol.BaseURL(cfg.Clients.StrActivator.URL),
	)
	if err != nil {
		log.Fatal().Err(err).Msg("Failed to initiate str-activator client")
	}
	activatorBriefCl := str_activator.New(activatorProtocol)

	inventoryTransport := clients.NewHTTPClient(cfg.Clients.StrInventory.Timeout, cfg.Clients.StrInventory.MaxIdleConns)
	inventoryCl := inventory.NewHTTPClient(inventoryTransport, cfg.Clients.StrInventory.URL)
	inventoryBaseV1Client := inventoryBaseV1.NewBaseJSONClient(cfg.Clients.StrInventory.URL, inventoryTransport)
	inventoryBaseV1Client = inventoryBaseV1.WrapBaseClient(inventoryBaseV1Client)
	inventoryBaseV1Client = inventoryBaseV1.BaseWrapStats(inventoryBaseV1Client, rpcStatsCl)
	inventoryInvV1Client := inventoryInvV1.NewInventoryProtobufClient(cfg.Clients.StrInventory.URL, inventoryTransport)
	inventoryInvV1Client = inventoryInvV1.WrapInventoryClient(inventoryInvV1Client)
	inventoryInvV1Client = inventoryInvV1.InventoryWrapStats(inventoryInvV1Client, rpcStatsCl)

	helpdeskTransport := clients.NewHTTPClient(cfg.Clients.Helpdesk.Timeout, cfg.Clients.Helpdesk.MaxIdleConns)
	helpdeskCl := helpdesk.NewHTTPClient(helpdeskTransport, os.Getenv(`SERVICE_HELPDESK_URL`))

	helpdeskCl2 := os.Getenv(`SERVICE_HELPDESK_URL`)

	booker := book.NewDealBooker(dealCl)
	intervalsCalendar := intervals.NewCalendar(inventoryCl, inventoryInvV1Client)

	restrictionsFetcherV1 := restrictions.NewFetcherV1(inventoryCl)

	userProfileCl := userProfile.NewClient(userProfile.Config{
		URL:     cfg.Clients.UserProfile.URL,
		XSource: "service-one-two",
	})

	messengerTransport := clients.NewHTTPClient(cfg.Clients.Messenger.Timeout, cfg.Clients.Messenger.MaxIdleConns)
	msgPlatform := client.NewClient(cfg.Clients.Messenger.URL, "str", messengerTransport)

	phonesHTTPCl := baseHTTP.NewDefaultHttpClient(baseHTTP.Config{URL: cfg.Clients.Phones.URL})
	phonesCl := phones.NewClient(phonesHTTPCl)

	rpcHandler := jsonrpc.NewHTTPMux(jsonrpc.WithStats(statsCl.Prefix("rpc")))

	var (
		requestSchema string
		validator     validate.Validator
	)

	requestSchema = "api/book_and_pay/v1/request"
	validator, err = validateFactory.GetValidator(requestSchema)
	if err != nil {
		log.Fatal().Err(err).Str("schema", requestSchema).Msg("failed to create validator")
	}
	rpcHandler.Register("str.bookAndPay.v1",
		rpchandlers.NewBookAndPayHandler(validator, booker))

	requestSchema = "api/approve_booking/v1/request"
	validator, err = validateFactory.GetValidator(requestSchema)
	if err != nil {
		log.Fatal().Err(err).Str("schema", requestSchema).Msg("failed to create validator")
	}
	rpcHandler.Register("str.approveBooking.v1",
		rpchandlers.NewApproveBookingHandler(validator, booker))

	requestSchema = "api/confirm_booking/v1/request"
	validator, err = validateFactory.GetValidator(requestSchema)
	if err != nil {
		log.Fatal().Err(err).Str("schema", requestSchema).Msg("failed to create validator")
	}
	rpcHandler.Register("str.confirmBooking.v1",
		rpchandlers.NewConfirmBookingHandler(validator, booker))

	requestSchema = "api/decline_booking/v1/request"
	validator, err = validateFactory.GetValidator(requestSchema)
	if err != nil {
		log.Fatal().Err(err).Str("schema", requestSchema).Msg("failed to create validator")
	}
	rpcHandler.Register("str.declineBooking.v1",
		rpchandlers.NewDeclineBookingHandler(validator, booker))

	requestSchema = "api/cancel_booking/v1/request"
	validator, err = validateFactory.GetValidator(requestSchema)
	if err != nil {
		log.Fatal().Err(err).Str("schema", requestSchema).Msg("failed to create validator")
	}
	rpcHandler.Register("str.cancelBooking.v1",
		rpchandlers.NewCancelBookingHandler(validator, booker))

	requestSchema = "api/void_booking/v1/request"
	validator, err = validateFactory.GetValidator(requestSchema)
	if err != nil {
		log.Fatal().Err(err).Str("schema", requestSchema).Msg("failed to create validator")
	}
	rpcHandler.Register("str.voidBooking.v1",
		rpchandlers.NewVoidBookingHandler(validator, booker))

	rpcHandler.Register("str.getOrderSummary.v1",
		rpchandlers.NewGetOrderSummaryHandler(dealTransport, cfg.Clients.StrDeal.URL))

	requestSchema = "api/get_item_intervals/v1/request"
	validator, err = validateFactory.GetValidator(requestSchema)
	if err != nil {
		log.Fatal().Err(err).Str("schema", requestSchema).Msg("failed to create validator")
	}
	rpcHandler.Register("str.getItemIntervals.v1",
		rpchandlers.NewGetItemIntervalsHandler(validator, intervalsCalendar))

	requestSchema = "api/do_payout/v1/request"
	validator, err = validateFactory.GetValidator(requestSchema)
	if err != nil {
		log.Fatal().Err(err).Str("schema", requestSchema).Msg("failed to create validator")
	}
	rpcHandler.Register("str.doPayout.v1",
		rpchandlers.NewDoPayoutHandler(validator, booker))

	requestSchema = "api/set_base/v1/request"
	validator, err = validateFactory.GetValidator(requestSchema)
	if err != nil {
		log.Fatal().Err(err).Str("schema", requestSchema).Msg("failed to create validator")
	}
	rpcHandler.Register("str.setBase.v1",
		rpchandlers.NewSetBaseHandler(validator, inventoryBaseV1Client))

	requestSchema = "api/get_base/v1/request"
	validator, err = validateFactory.GetValidator(requestSchema)
	if err != nil {
		log.Fatal().Err(err).Str("schema", requestSchema).Msg("failed to create validator")
	}
	rpcHandler.Register("str.getBase.v1",
		rpchandlers.NewGetBaseHandler(validator, inventoryBaseV1Client))

	requestSchema = "api/set_interval/v1/request"
	validator, err = validateFactory.GetValidator(requestSchema)
	if err != nil {
		log.Fatal().Err(err).Str("schema", requestSchema).Msg("failed to create validator")
	}
	rpcHandler.Register("str.setInterval.v1",
		rpchandlers.NewSetIntervalHandler(validator, intervalsCalendar))

	requestSchema = "api/set_intervals/v1/request"
	validator, err = validateFactory.GetValidator(requestSchema)
	if err != nil {
		log.Fatal().Err(err).Str("schema", requestSchema).Msg("failed to create validator")
	}
	rpcHandler.Register("str.setIntervals.v1",
		rpchandlers.NewSetIntervalsHandler(validator, intervalsCalendar))

	requestSchema = "api/get_compiled/v1/request"
	validator, err = validateFactory.GetValidator(requestSchema)
	if err != nil {
		log.Fatal().Err(err).Str("schema", requestSchema).Msg("failed to create validator")
	}
	rpcHandler.Register("str.getCompiled.v1",
		rpchandlers.NewGetCompiledHandler(validator, inventoryCl))

	requestSchema = "api/calculate_detailized/v1/request"
	validator, err = validateFactory.GetValidator(requestSchema)
	if err != nil {
		log.Fatal().Err(err).Str("schema", requestSchema).Msg("failed to create validator")
	}
	rpcHandler.Register("str.calculateDetailized.v1",
		rpchandlers.NewCalcDetailizedHandler(validator, inventoryCl))

	requestSchema = "api/calc_avg_prices/v1/request"
	validator, err = validateFactory.GetValidator(requestSchema)
	if err != nil {
		log.Fatal().Err(err).Str("schema", requestSchema).Msg("failed to create validator")
	}
	rpcHandler.Register("str.calculateAvgPrices.v1",
		rpchandlers.NewCalcAvgPricesV1Handler(validator, inventoryCl))

	requestSchema = "api/get_item_restrictions/v1/request"
	validator, err = validateFactory.GetValidator(requestSchema)
	if err != nil {
		log.Fatal().Err(err).Str("schema", requestSchema).Msg("failed to create validator")
	}
	rpcHandler.Register("str.getItemRestrictions.v1",
		rpchandlers.NewGetItemRestrictionsHandler(validator, intervalsCalendar))

	requestSchema = "api/check_revocation_penalty/v1/request"
	validator, err = validateFactory.GetValidator(requestSchema)
	if err != nil {
		log.Fatal().Err(err).Str("schema", requestSchema).Msg("failed to create validator")
	}
	rpcHandler.Register("str.checkRevocationPenalty.v1",
		rpchandlers.NewCheckRevocationPenaltyHandler(validator, booker))

	requestSchema = "api/revoke_booking/v1/request"
	validator, err = validateFactory.GetValidator(requestSchema)
	if err != nil {
		log.Fatal().Err(err).Str("schema", requestSchema).Msg("failed to create validator")
	}
	rpcHandler.Register("str.revokeBooking.v1",
		rpchandlers.NewRevokeBookingHandler(validator, booker))

	requestSchema = "api/hold_booking/v1/request"
	validator, err = validateFactory.GetValidator(requestSchema)
	if err != nil {
		log.Fatal().Err(err).Str("schema", requestSchema).Msg("failed to create validator")
	}
	rpcHandler.Register("str.holdBooking.v1",
		rpchandlers.NewHoldBookingHandler(validator, booker))

	requestSchema = "api/set_interval_params/v1/request"
	validator, err = validateFactory.GetValidator(requestSchema)
	if err != nil {
		log.Fatal().Err(err).Str("schema", requestSchema).Msg("failed to create validator")
	}
	rpcHandler.Register("str.setIntervalParams.v1",
		rpchandlers.NewSetIntervalParamsHandler(validator, intervalsCalendar))

	requestSchema = "api/bookingability/activate/v1/request"
	validator, err = validateFactory.GetValidator(requestSchema)
	if err != nil {
		log.Fatal().Err(err).Str("schema", requestSchema).Msg("failed to create validator")
	}
	rpcHandler.Register("str.activateItems.v1",
		bookingability.NewActivateV1Handler(validator, activatorCl))

	requestSchema = "api/bookingability/deactivate/v1/request"
	validator, err = validateFactory.GetValidator(requestSchema)
	if err != nil {
		log.Fatal().Err(err).Str("schema", requestSchema).Msg("failed to create validator")
	}
	rpcHandler.Register("str.deactivateItems.v1",
		bookingability.NewDeactivateV1Handler(validator, activatorCl))

	requestSchema = "api/bookingability/check/v1/request"
	validator, err = validateFactory.GetValidator(requestSchema)
	if err != nil {
		log.Fatal().Err(err).Str("schema", requestSchema).Msg("failed to create validator")
	}
	rpcHandler.Register("str.checkItemsActive.v1",
		bookingability.NewCheckV1Handler(validator, activatorCl))

	requestSchema = "api/oasis/activate/v1/request"
	validator, err = validateFactory.GetValidator(requestSchema)
	if err != nil {
		log.Fatal().Err(err).Str("schema", requestSchema).Msg("failed to create validator")
	}
	rpcHandler.Register("str.activateOasis.v1",
		oasis.NewActivateV1Handler(validator, activatorCl))

	requestSchema = "api/oasis/deactivate/v1/request"
	validator, err = validateFactory.GetValidator(requestSchema)
	if err != nil {
		log.Fatal().Err(err).Str("schema", requestSchema).Msg("failed to create validator")
	}
	rpcHandler.Register("str.deactivateOasis.v1",
		oasis.NewDeactivateV1Handler(validator, activatorCl))

	requestSchema = "api/oasis/check/v1/request"
	validator, err = validateFactory.GetValidator(requestSchema)
	if err != nil {
		log.Fatal().Err(err).Str("schema", requestSchema).Msg("failed to create validator")
	}
	rpcHandler.Register("str.checkOasis.v1",
		oasis.NewCheckV1Handler(validator, activatorCl))

	requestSchema = "api/oasis/request/v1/request"
	validator, err = validateFactory.GetValidator(requestSchema)
	if err != nil {
		log.Fatal().Err(err).Str("schema", requestSchema).Msg("failed to create validator")
	}
	rpcHandler.Register("str.requestOasis.v1",
		oasis.NewRequestV1Handler(validator, helpdeskCl, userProfileCl))

	requestSchema = "api/get_item_bookings/v1/request"
	validator, err = validateFactory.GetValidator(requestSchema)
	if err != nil {
		log.Fatal().Err(err).Str("schema", requestSchema).Msg("failed to create validator")
	}
	rpcHandler.Register("str.getItemBookings.v1",
		rpchandlers.NewGetItemBookingsHandler(validator, dealCl))

	requestSchema = "api/make_booking/v1/request"
	validator, err = validateFactory.GetValidator(requestSchema)
	if err != nil {
		log.Fatal().Err(err).Str("schema", requestSchema).Msg("failed to create validator")
	}
	rpcHandler.Register("str.makeBooking.v1",
		rpchandlers.NewMakeBookingHandler(validator, dealCl))

	requestSchema = "api/update_booking_dates/v1/request"
	validator, err = validateFactory.GetValidator(requestSchema)
	if err != nil {
		log.Fatal().Err(err).Str("schema", requestSchema).Msg("failed to create validator")
	}
	rpcHandler.Register("str.updateBookingDates.v1",
		rpchandlers.NewUpdateBookingDatesV1Handler(validator, booking.NewSTRDealUpdater(dealCl)))

	requestSchema = "api/get_actual_item_intervals/v1/request"
	validator, err = validateFactory.GetValidator(requestSchema)
	if err != nil {
		log.Fatal().Err(err).Str("schema", requestSchema).Msg("failed to create validator")
	}
	rpcHandler.Register("str.getActualItemIntervals.v1",
		rpchandlers.NewGetActualItemIntervalsHandler(validator, intervalsCalendar))

	requestSchema = "api/resend_order_bubble/v1/request"
	validator, err = validateFactory.GetValidator(requestSchema)
	if err != nil {
		log.Fatal().Err(err).Str("schema", requestSchema).Msg("falied to create validator")
	}
	rpcHandler.Register("str.resendOrderBubble.v1", bubbles.NewResendOrderBubbleV1Handler(validator, dealCl))

	requestSchema = "api/resend_payout_bubble/v1/request"
	validator, err = validateFactory.GetValidator(requestSchema)
	if err != nil {
		log.Fatal().Err(err).Str("schema", requestSchema).Msg("falied to create validator")
	}
	rpcHandler.Register("str.resendPayoutBubble.v1", bubbles.NewResendPayoutBubbleV1Handler(validator, dealCl))

	requestSchema = "api/set_closed_intervals/v1/request"
	validator, err = validateFactory.GetValidator(requestSchema)
	if err != nil {
		log.Fatal().Err(err).Str("schema", requestSchema).Msg("failed to create validator")
	}
	rpcHandler.Register("str.setClosedIntervals.v1",
		rpchandlers.NewSetClosedIntervalsV1Handler(validator, intervalsCalendar))

	requestSchema = "api/actual_status/v1/request"
	validator, err = validateFactory.GetValidator(requestSchema)
	if err != nil {
		log.Fatal().Err(err).Str("schema", requestSchema).Msg("failed to create validator")
	}
	rpcHandler.Register("str.actualStatus.v1", rpchandlers.NewActualStatusHandler(validator, inventoryCl))

	requestSchema = "api/actual_statuses/v1/request"
	validator, err = validateFactory.GetValidator(requestSchema)
	if err != nil {
		log.Fatal().Err(err).Str("schema", requestSchema).Msg("failed to create validator")
	}
	rpcHandler.Register("str.actualStatuses.v1", rpchandlers.NewActualStatusesHandler(validator, inventoryCl))

	requestSchema = "api/moderation/v1/request"
	validator, err = validateFactory.GetValidator(requestSchema)
	if err != nil {
		log.Fatal().Err(err).Str("schema", requestSchema).Msg("failed to create validator")
	}
	rpcHandler.Register(
		"str.changeModerationStatus.v1",
		rpchandlers.NewChangeModerationStatusHandler(validator, dealCl),
	)

	requestSchema = "api/get_min_price/v1/request"
	validator, err = validateFactory.GetValidator(requestSchema)
	if err != nil {
		log.Fatal().Err(err).Str("schema", requestSchema).Msg("failed to create validator")
	}
	rpcHandler.Register(
		"str.getMinPrice.v1",
		rpchandlers.NewGetMinPriceHandler(validator, pricesCl, log),
	)

	requestSchema = "api/get_min_price_mobile/v1/request"
	validator, err = validateFactory.GetValidator(requestSchema)
	if err != nil {
		log.Fatal().Err(err).Str("schema", requestSchema).Msg("failed to create validator")
	}
	rpcHandler.Register(
		"str.getMinPriceMobile.v1",
		rpchandlers.NewGetMinPriceMobileHandler(validator, pricesCl, log),
	)

	requestSchema = "api/bookingability/trusted-host-status/v1/request"
	validator, err = validateFactory.GetValidator(requestSchema)
	if err != nil {
		log.Fatal().Err(err).Str("schema", requestSchema).Msg("failed to create validator")
	}
	rpcHandler.Register("str.trustedHostStatus.v1", bookingability.NewTrustedHostV1Handler(validator, activatorBriefCl))

	calendarHandlers := []struct {
		schema string
		route  string
		ctor   func(validate.Validator, inventory.Client) *calendars.Handler
	}{
		{
			schema: "calendar_import",
			route:  "calendarImport",
			ctor:   calendars.NewImportHandler,
		},
		{
			schema: "calendar_export",
			route:  "calendarExport",
			ctor:   calendars.NewExportHandler,
		},
		{
			schema: "calendar_removal",
			route:  "calendarRemoval",
			ctor:   calendars.NewRemovalHandler,
		},
		{
			schema: "calendar_force_sync",
			route:  "calendarForceSync",
			ctor:   calendars.NewForceHandler,
		},
		{
			schema: "calendars_list",
			route:  "calendarsList",
			ctor:   calendars.NewListHandler,
		},
	}
	for _, handler := range calendarHandlers {
		schemaName := fmt.Sprintf("api/%s/v1/request", handler.schema)
		routeName := fmt.Sprintf("str.%s.v1", handler.route)
		validator, err = validateFactory.GetValidator(schemaName)
		if err != nil {
			log.Fatal().Err(err).Str("schema", schemaName).Msg("failed to create validator")
		}
		rpcHandler.Register(routeName, handler.ctor(validator, inventoryCl))
	}

	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"https://www.example.com", "https://*.example.com"},
		AllowedHeaders:   []string{"Content-Type"},
		AllowedMethods:   []string{"POST"},
		AllowCredentials: true,
		// Enable Debugging for testing, consider disabling in production
		Debug: cfg.Logger.Env != "prod",
	})

	http.Handle("/rpc/", c.Handler(rpcHandler))
	http.Handle("/k8s/desktop/str", jsonrpc.UserIDInject(c.Handler(jsonrpc.NewProtected(rpcHandler, []string{
		"str.checkRevocationPenalty.v1",
		"str.requestOasis.v1",
		"str.getActualItemIntervals.v1",
	}))))

	http.Handle("/", baseHandlers.NewDefaultHandler(nil))
	http.Handle("/_info", baseHandlers.NewInfoHandler(info.New()))
	http.Handle("/_error", baseHandlers.NewErrorHandler(nil))

	secret := []byte("secret_code")

	tokenHMACSigner := signer.NewHS256()
	key := jwtee.NewSharedSecretKey(secret)
	tokenBuilder := jwtee.NewTokenBuilder()
	tokenIssuer := auth.NewJWTeeTokenIssuer(tokenBuilder, tokenHMACSigner, key)

	hashMux := router.New()

	mobileSrv := mobile.NewServer(
		restrictionsFetcherV1,
		userProfileCl,
		inventoryCl,
		inventoryBaseV1Client,
		inventoryInvV1Client,
		phonesCl,
		dealCl,
		activatorCl,
	)
	mobileSrv.Routes(hashMux, tokenIssuer)

	messengerCl := msgclient.New(messengerTransport, cfg.Clients.Messenger.URL)
	oasisSender := oasis.NewChatSender(msgPlatform, messengerCl)
	slackCl := slack.New("TESTSECRET1234")
	oasisNotifier := slacknotifier.New(slackCl)
	oasisRequester := oasis.NewRequesterV1(oasisSender, oasisNotifier)

	bookingApprover := booking.NewSTRDealApprover(dealCl)
	bookingConfirmer := booking.NewSTRDealConfirmer(dealCl)
	bookingCanceler := booking.NewSTRDealCanceler(dealCl)
	bookingDecliner := booking.NewSTRDealDecliner(dealCl)
	bookingRevoker := booking.NewSTRDealRevoker(dealCl)
	cancellationPrompter := booking.NewSTRDealCancellationPrompter(dealCl)
	cancellationActions := booking.NewSTRDealCancellationActions(dealCl)

	messengerSrv := messenger.NewServer(
		bookingApprover,
		bookingConfirmer,
		bookingCanceler,
		bookingDecliner,
		bookingRevoker,
		cancellationPrompter,
		cancellationActions,
		oasisRequester,
	)
	messengerSrv.Routes(hashMux, tokenIssuer)

	// ----------------------
	// Twirp endpoints
	// ----------------------
	twirpStats := statsCl.Prefix("twirp")

	twirpRPC := twirtr.NewRouter()

	payoutV1Service := payoutserviceV1.New(dealCl)
	payoutV1Server := payoutserverV1.New(payoutV1Service)

	payoutV1MakerHandler := payoutrpcV1.NewMakerServerHandler(payoutV1Server, twirpStats)
	twirpRPC.Register(payoutrpcV1.MakerPathPrefix, payoutV1MakerHandler)
	// ----------------------

	httpMarketplaceTransport := clients.NewHTTPClient(cfg.Clients.StrMarketplace.Timeout, cfg.Clients.StrMarketplace.MaxIdleConns)
	mplaceCfg := mplaceV2.NewConfiguration()
	mplaceCfg.UserAgent = "service-one-two"
	mplaceCfg.HTTPClient = httpMarketplaceTransport
	mplaceCfg.BasePath = cfg.Clients.StrMarketplace.URL
	mplaceCl := mplaceV2.NewAPIClient(mplaceCfg)
	marketplaceCl := marketplace.NewClient(mplaceCl)

	mux := http.DefaultServeMux
	briefServer := protocol.NewServer(protocol.CustomMux(mux))
	briefInfo := service.ItemsInfo(items_info.New(activatorCl, inventoryCl, marketplaceCl).Handle)
	briefInfo(briefServer)

	itemServiceClient := service_item_client.NewClient("service-str-inventory", cfg.Clients.Item.URL)
	sellerChecker := seller.NewEqualityChecker(itemServiceClient)
	apiHelper := api.NewHelper(sellerChecker)

	metric, err := metrics.New()
	if err != nil {
		log.Fatal().Err(err).Msg("failed to create metrics")
	}
	apiRouter.WithMetricsClient(metric)

	newApiRouter := apiRouter.NewDefaultRouter()
	newApiRouter.RegisterMiddleware(middlewares.TrailingSlashMiddleware)
	newApiRouter.Register(putBookingsInfoHandle.Handle(putBookingsInfo.New(intervalsCalendar, apiHelper, &log)))
	newApiRouter.Register(postRealtyPricesHandle.Handle(postRealtyPrices.New(intervalsCalendar, apiHelper, &log)))
	newApiRouter.Register(getRealtyBookingsHandle.Handle(getRealtyBookings.New(dealCl, apiHelper, &log)))

	httpHandler := func(w http.ResponseWriter, r *http.Request) {
		head := head(r.URL.Path)
		switch head {
		case "api":
			h := mobile.MetadataInject(hashMux)
			h.ServeHTTP(w, r)
			return
		case "messenger":
			hashMux.ServeHTTP(w, r)
			return
		case "twirp":
			r.URL.Path = strings.TrimRight(r.URL.Path, "/")
			twirpRPC.ServeHTTP(w, r)
			return
		case "core", "realty":
			newApiRouter.ServeHTTP(w, r)
			return
		default:
			mux.ServeHTTP(w, r)
		}
	}

	httpServingChain := alice.New(
		hlog.NewHandler(log),
		middleware.Recovery(),
		metadata.ContextInjector,
		middleware.MetadataLogging(),
		customMiddleware.HTTPStats(statsCl.Prefix("transport")),
		middleware.HTTPLog(),
	).ThenFunc(httpHandler)

	srv := server.New(httpServingChain, cfg, &log)
	err = srv.comn()
	if err != nil {
		log.Fatal().Err(err).Msg("Server start failed.")
	}
}

// shiftPath splits the given path into the first segment (head).
// For example, "/foo/bar/baz" gives "foo".
func head(p string) (head string) {
	p = path.Clean("/" + p)
	i := strings.Index(p[1:], "/") + 1
	if i <= 0 {
		return p[1:]
	}
	return p[1:i]
}