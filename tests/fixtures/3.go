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
key := time.Now().Format("01.02.2006")