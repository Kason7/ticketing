const Import = require('@kason7-ticketing/common');
const { Publisher } = Import('events', 'basePublisher');
const { Subject } = Import('events', 'subjects');

// CHILDREN CLASS
class ExpirationCompletedPublisher extends Publisher {
  subject = Subject.EXPIRATION_COMPLETED;
}

exports.ExpirationCompletedPublisher = ExpirationCompletedPublisher;
