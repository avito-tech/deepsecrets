var (
	caKeyPEM = []byte(`TESTSECRET1234
`)
)

bsonFilters = append(bsonFilters, bson.M{
	"start": bson.D{{Key: "$gte", Value: in.ActiveAt.Gte}},
})

//	unix://<user>:<password>@</path/to/redis.sock>?db=<db_number>
