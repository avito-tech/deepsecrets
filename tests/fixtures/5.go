conn, err := amqp.Dial("amqp://guest:guest@localhost:5672/")
aes_key := os.Getenv("AES_KEY")