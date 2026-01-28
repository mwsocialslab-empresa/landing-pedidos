import express from "express";
import cors from "cors";
import mercadopago from "mercadopago";

const app = express();
app.use(cors());
app.use(express.json());

// 🔴 PONÉ TU ACCESS TOKEN ACÁ
mercadopago.configure({
  access_token: "TU_ACCESS_TOKEN_AQUI"
});

app.post("/crear-preferencia", async (req, res) => {
  const { total } = req.body;

  try {
    const preference = {
      items: [
        {
          title: "Compra en tienda",
          quantity: 1,
          unit_price: Number(total),
          currency_id: "ARS"
        }
      ],
      back_urls: {
        success: "https://tusitio.com/gracias.html",
        failure: "https://tusitio.com/error.html"
      },
      auto_return: "approved"
    };

    const response = await mercadopago.preferences.create(preference);
    res.json({ init_point: response.body.init_point });

  } catch (error) {
    console.error(error);
    res.status(500).send("Error Mercado Pago");
  }
});

app.listen(3000, () => {
  console.log("Servidor corriendo en http://localhost:3000");
});
