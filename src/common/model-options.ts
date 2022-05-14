function omitPrivate(doc, obj) {
  delete obj.__v;
  return obj;
}

export default {
  toJSON: { virtuals: false, transform: omitPrivate },
  toObject: { virtuals: false },
  timestamps: true,
};
