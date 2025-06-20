exports.formatDate = (date) => {
  return new Date(date).toLocaleString('en-US', { timeZone: 'UTC' });
};
