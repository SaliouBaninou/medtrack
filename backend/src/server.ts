import "dotenv/config";
import express from "express";
import morgan from "morgan";
import cors from "cors";
import { allowedOrigins } from "./utils/constants.js";
import { fromNodeHeaders, toNodeHandler } from "better-auth/node";
import { requireAuthentication } from "./middleware/authentication.js";
import { auth } from "./lib/auth.js";
import routes from "./router/index.js";
const app = express();
const port = process.env.PORT || 3001;

app.use(morgan("dev"));
app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }),
);
app.all("/api/auth/*splat", toNodeHandler(auth));
app.use(express.json());
app.use("/api", routes);

app.get("/fake-user", async (req, res) => {
  try {
    const data = await auth.api.signUpEmail({
      body: {
        name: "John Doe", // required, The name of the user.
        email: "john.doe@example.com", // required, The email address of the user.
        password: "password1234", // required, The password of the user. It should be at least 8 characters long and max 128 by default.
        image: "https://example.com/image.png", // An optional profile image of the user.
        callbackURL: "https://example.com/callback", // An optional URL to redirect to after the user signs up.
      },
    });
    return res.status(201).json(data);
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ message: error.message });
  }
});

app.get("/fake-login", async (req, res) => {
  try {
    const headers = new Headers();

    for (const [key, value] of Object.entries(req.headers)) {
      if (value !== undefined) {
        headers.set(key, Array.isArray(value) ? value.join(", ") : value);
      }
    }

    const data = await auth.api.signInEmail({
      body: {
        email: "john.doe@example.com",
        password: "password1234",
        rememberMe: true,
        callbackURL: "https://example.com/callback",
      },
      headers,
    });

    res.json(data);
  } catch (err) {
    const error = err as Error;

    res.status(500).json({
      message: error.message,
    });
  }
});


app.get("/api/me", requireAuthentication, (req, res) => {
  return res.json({
    success: true,
    user: res.locals.user,
    session: res.locals.session,
  });
});

app.listen(port, () => console.log(`Server demarer localhost:${port}`));
