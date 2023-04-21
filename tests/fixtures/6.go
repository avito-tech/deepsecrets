func TestPostgresStringer(t *testing.T) {
	t.Run("Normal", func(t *testing.T) {
		testPostgresStringer(
			t,
			Postgres{
				Host:     "localhost",
				Port:     5432,
				User:     "user",
				Password: "password",
				DBName:   "main",
			},
			"postgres://user:password@localhost:5432/main?sslmode=disable&binary_parameters=yes",
		)
	})
}
