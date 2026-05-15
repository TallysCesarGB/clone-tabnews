export const up = (pgm) => {
  pgm.createTable("users", {
    id: {
      type: "uuid",
      primaryKey: true,
      default: pgm.func("gen_random_uuid()"),
    },
    // For reference, GitHub limits usernames to 39 characters
    username: {
      type: "varchar(30)",
      notNull: true,
      unique: true,
    },
    email: {
      // 254 is the maximum length of an email address according to RFC 5321
      // https://stackoverflow.com/a/1199238
      type: "varchar(254)",
      notNull: true,
      unique: true,
    },
    password: {
      // 72 is the maximum length of a bcrypt hash
      // https://security.stackexchange.com/a/39851
      type: "varchar(72)",
      notNull: true,
    },
    // Timestamps
    // Using "timestamp with time zone" to ensure that timestamps are stored in UTC and can be easily converted to the user's local time zone when needed.
    // https://justatheory.com/2012/04/postgres-use-timestamptz/
    created_at: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
    updated_at: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
  });
};

export const down = false;
