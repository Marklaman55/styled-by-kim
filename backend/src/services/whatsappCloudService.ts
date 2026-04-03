import axios from 'axios';

const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

export const sendWhatsAppMessage = async (to: string, message: string) => {
  try {
    const response = await axios.post(
      `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to: to,
        type: "text",
        text: {
          body: message
        }
      },
      {
        headers: {
          Authorization: `Bearer ${WHATSAPP_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ WhatsApp Cloud message sent:', response.data);
    return response.data;

  } catch (error: any) {
    console.error('❌ WhatsApp Cloud API Error:', error.response?.data || error.message);
    console.warn('⚠️ Ensure recipient is added in Meta WhatsApp test numbers');
    throw error;
  }
};
