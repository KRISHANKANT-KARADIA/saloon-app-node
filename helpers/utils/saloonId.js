import Counter from '../models/counters.model.js';

export async function getNextSaloonId() {
  const counter = await Counter.findOneAndUpdate(
    { id: 'saloonId' },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return counter.seq;
}
