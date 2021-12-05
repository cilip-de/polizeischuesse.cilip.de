import { SMTPClient } from "emailjs";
import rateLimit from "express-rate-limit";
import type { NextApiRequest, NextApiResponse } from "next";

const client = new SMTPClient({
  user: process.env.EMAIL_SENDER,
  password: process.env.EMAIL_PW,
  host: process.env.EMAIL_HOST,
  tls: true,
  port: 587,
});

function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }

      return resolve(result);
    });
  });
}

// limit to 5 per hour
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  // extract ip
  keyGenerator: (req) => {
    const forwarded = req.headers["x-real-ip"];
    const ip = forwarded ? forwarded : req.socket.remoteAddress;
    return ip;
  },
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.status(405).send({ message: "Only POST requests allowed" });
    return;
  }

  await runMiddleware(req, res, limiter);

  const body = JSON.parse(req.body);

  try {
    await client.sendAsync({
      text: body.text,
      from: process.env.EMAIL_SENDER,
      to: process.env.EMAIL_RECIPIENTS,
      subject: "Nachricht von polizeischuesse.cilip.de",
    });
    res.status(200).json({});
  } catch {
    res.status(500).json({});
  }
}
