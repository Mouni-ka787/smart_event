/*
Simple test script to POST an event booking to the backend.
Usage (Powershell):
$env:API_URL = "http://localhost:5000/api"; $env:TOKEN = "<YOUR_BEARER_TOKEN>"; $env:EVENT_ID = "<EVENT_ID>"; node tools/testBooking.js

The script reads these environment variables:
- API_URL (default: http://localhost:5000/api)
- TOKEN (required) - the Bearer token string (not including "Bearer ")
- EVENT_ID (required) - the MongoDB event id to book

It will POST to `${API_URL}/bookings/event` and print the response.
*/

const API_URL = process.env.API_URL || 'http://localhost:5000/api';
const TOKEN = process.env.TOKEN;
const EVENT_ID = process.env.EVENT_ID;

if (!TOKEN) {
  console.error('ERROR: TOKEN environment variable is required (set a user JWT)');
  process.exit(1);
}

if (!EVENT_ID) {
  console.error('ERROR: EVENT_ID environment variable is required');
  process.exit(1);
}

const payload = {
  eventId: EVENT_ID,
  eventName: 'Test Event Booking from script',
  eventDate: new Date(Date.now() + 24 * 3600 * 1000).toISOString(), // tomorrow
  guestCount: 2,
  venueAddress: 'Test Venue Address',
  venueLat: 0,
  venueLng: 0,
  specialRequests: 'No special requests'
};

(async () => {
  try {
    console.log('POST', `${API_URL}/bookings/event`);
    console.log('Payload:', payload);

    const res = await fetch(`${API_URL}/bookings/event`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TOKEN}`
      },
      body: JSON.stringify(payload)
    });

    console.log('Status:', res.status, res.statusText);
    let bodyText = '';
    try {
      const json = await res.json();
      console.log('Response JSON:', JSON.stringify(json, null, 2));
    } catch (e) {
      bodyText = await res.text();
      console.log('Response text:', bodyText);
    }

    if (!res.ok) {
      process.exit(2);
    }
  } catch (err) {
    console.error('Request failed:', err);
    process.exit(3);
  }
})();
