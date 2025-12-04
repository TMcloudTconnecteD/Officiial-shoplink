import axios from "axios"

export const sendWatiMessage = async (to, message) => {
  try {
    await axios.post(
      "https://app.wati.io/api/v1/sendMessage",
      {
        phone: to,
        message
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.WATI_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    )
  } catch (error) {
    console.log("WATI Error", error.response?.data || error.message)
  }
}
