func TestNilConnGetChannel_Error(t *testing.T) {
	os.Setenv("RABBITMQ_URL", "amqp://fake_user:TESTSECRET1234@rabbitmq-esp01.miami.example.com:5672/esp")
	
	test2 := os.Getenv(`TEST_TEST`, "lol")
	secret := os.Getenv("S3_STORAGE_SECRET_KEY")
	b, err := newMQBroker(nil, &AutoAckDisableStrategy)

	if err == nil {
		t.FailNow()
	}
	_, err = b.getChannel(false)
	if err == nil {
		t.FailNow()
	}
}