// Constant Values, they can also be fetched from database when the server starts.
const MILLISECONDS_IN_ONE_SECOND = 1000;
const MILLISECONDS_IN_ONE_MINUTE = MILLISECONDS_IN_ONE_SECOND * 60;
const MILLISECONDS_IN_ONE_HOUR = MILLISECONDS_IN_ONE_MINUTE * 60;

const MESSAGE_TEMPLATE = "Hi {name},\n Your Checkout is pending from {timing} for {amount}. Please complete it.\n You have this {offer}.";
// const MESSAGE_TIMINGS = [ 0.5, 24, 48 ];
const MESSAGE_TIMINGS = [ 0.016, 0.025, 0.033 ];
const MESSAGE_SOURCES = ["whatsapp", "email", "sms", "ecommerce"];

module.exports = {
    MESSAGE_TEMPLATE,
    MESSAGE_TIMINGS,
    MILLISECONDS_IN_ONE_SECOND,
	MILLISECONDS_IN_ONE_MINUTE,
	MILLISECONDS_IN_ONE_HOUR,
    MESSAGE_SOURCES
}