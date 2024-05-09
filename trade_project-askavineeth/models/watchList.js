const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const watchListSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'user' },
    trade: { type: Schema.Types.ObjectId, ref: 'stories' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('WatchList', watchListSchema);
