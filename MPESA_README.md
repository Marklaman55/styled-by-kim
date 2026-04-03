# M-Pesa STK Push Integration Guide

This application uses the **Safaricom Daraja 3.0 API** to process payments via M-Pesa STK Push.

## How it Works

1.  **Booking Initiation**: When a client selects "Deposit" or "Full Payment" during booking, the frontend sends a request to `/api/mpesa/stkpush`.
2.  **STK Push Request**: The server:
    *   Generates an OAuth access token from Safaricom.
    *   Calculates the 50% deposit (if applicable).
    *   Sends an STK Push request to the client's phone number.
    *   Creates a pending `MpesaTransaction` record in the database.
3.  **User Interaction**: The client receives a popup on their phone asking for their M-Pesa PIN.
4.  **Callback Processing**: Safaricom sends a POST request to our `/api/mpesa/callback` endpoint with the result.
5.  **Status Update**:
    *   **Success**: The `MpesaTransaction` is updated to `success`, the corresponding `Booking` is marked as `confirmed`, and WhatsApp/Email notifications are sent to both the client and the admin.
    *   **Failure**: The transaction is marked as `failed`, and notifications are sent explaining the error.

## Configuration

All M-Pesa credentials can be managed via the **Admin Dashboard > System Config** section:

*   **Consumer Key & Secret**: Obtained from your Daraja App.
*   **Shortcode**: Your Paybill or Till number (use `174379` for sandbox).
*   **Passkey**: Obtained from the "Simulate" tab in Daraja (for sandbox).
*   **Callback URL**: The public URL where Safaricom will send the results. This is automatically generated based on your `BACKEND_URL`.

## Testing (Sandbox)

To test the integration in sandbox mode:
1.  Use the test credentials provided by Safaricom.
2.  Ensure your phone number is registered for sandbox testing.
3.  The amount is fixed to 1 KES for some sandbox tests, but our app sends the actual calculated amount.

## Troubleshooting

*   **Invalid Token**: Check your Consumer Key and Secret.
*   **Callback Not Received**: Ensure your `BACKEND_URL` is publicly accessible and correctly set in the System Config.
*   **Request Timeout**: Safaricom's sandbox can sometimes be slow; check the server logs for detailed error messages.
