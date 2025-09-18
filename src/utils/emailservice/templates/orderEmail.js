const { sendEmail } = require("../emailService");

async function sendOrderCreatedEmail(email, order) {
  try {
    const sender = "Guniba <postmaster@mail.guniba.net>";
    const subject = `Your Order #${order.orderNo} Has Been Created`;
    console.log(order, "order");
    // Format items list into HTML
    const itemsList = order.items
      .map(
        (item) => `
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;">  ${
            item.variantId?.productId?.name || "Unnamed Product"
          }</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${
            item.quantity
          }</td>
          <td style="padding: 8px; border: 1px solid #ddd;">₦${item.price.toLocaleString()}</td>
        </tr>
      `
      )
      .join("");

    const messageTemplate = () => `
      <p>Hello,</p>
      <p>Thank you for shopping with <b>Guniba</b>. Your order has been successfully created and is now awaiting shipping.</p>
      <p><b>Order Number:</b> ${order.orderNo}</p>

      <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
        <thead>
          <tr>
            <th style="padding: 8px; border: 1px solid #ddd; background: #f4f4f4;">Item</th>
            <th style="padding: 8px; border: 1px solid #ddd; background: #f4f4f4;">Quantity</th>
            <th style="padding: 8px; border: 1px solid #ddd; background: #f4f4f4;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${itemsList}
        </tbody>
      </table>

      <p style="margin-top: 10px; font-size: 1.2em;">
        <b>Total:</b> ₦${order.totalPrice.toLocaleString()}
      </p>

      <p>Your order is being processed and will be shipped soon. You will receive another email once it has been dispatched.</p>
      
      <p>Thank you for choosing Guniba!</p>
      <p>— The Guniba Team</p>
    `;

    const emailSent = await sendEmail({
      sender,
      recipient: email,
      subject,
      messageTemplate,
    });

    if (!emailSent || emailSent.message !== "Queued. Thank you.") {
      console.error("❌ Failed to send order email for:", email, emailSent);
      return null;
    }

    return emailSent;
  } catch (error) {
    console.error("❌ Error sending order created email:", error.message);
    return null;
  }
}

module.exports = { sendOrderCreatedEmail };
