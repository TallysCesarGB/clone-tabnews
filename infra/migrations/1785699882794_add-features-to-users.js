export const up = (pgm) => {
  pgm.addColumns("users", {
    features: {
      type: "varchar[]",
      notNull: true,
      default: "{}",
    },
  });
};

export const down = false;
