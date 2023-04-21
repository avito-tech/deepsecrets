const (
	testKeyPEM = `
	asdf
	df
	sad
	`

	bla = "lol"
)

func init() {
	testKey = parseRSA(testKeyPEM, "TESTSECRET1234")
}

claims := struct{ Msg string }{"TESTSECRET1234"}