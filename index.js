import express, { json } from "express";
import cors from "cors";
import helmet from "helmet";
import nodemailer from "nodemailer";
import nodemailerExpressHandlebars from "nodemailer-express-handlebars";
import { engine, create } from "express-handlebars";
import { join } from "path";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Seguridad y CORS
app.use(helmet());
app.use(cors());
app.use(json());

// Configuración del motor de plantillas Handlebars
const hbsInstance = create({
	extname: ".hbs",
	layoutsDir: join(__dirname, "views"),
	defaultLayout: false,
	helpers: {
		eq: (a, b) => a === b,
		not: (value) => !value,
	},
});

// Transporter de Nodemailer (usa Mailtrap o tu SMTP)
const transporter = nodemailer.createTransport({
	host: "oceanikacargo.promogo.online", // Usa tu host SMTP
	port: 465, // Puerto SMTP
	auth: {
		user: "test@oceanikacargo.promogo.online",
		pass: "7Sv_7d38g",
	},
	tls: {
		rejectUnauthorized: false,
	},
});

// Configuración para usar plantillas con Nodemailer
transporter.use(
	"compile",
	nodemailerExpressHandlebars({
		viewEngine: hbsInstance,
		viewPath: join(__dirname, "views"),
		extName: ".hbs",
	})
);

// Ruta para enviar correo
app.post("/send-email", async (req, res) => {
	const body = req.body;
	console.log(body);

	if (!body.email) {
		return res
			.status(400)
			.json({ error: "Faltan parámetros: to son requeridos." });
	}

	try {
		const result = await transporter.sendMail({
			from: '"Contacto" <test@oceanikacargo.promogo.online>',
			to: body.email,
			bcc: "test@oceanikacargo.promogo.online" || "",
			subject: "Solicitud de envio de carga",
			template: "email",
			context: {
				...body,
				isMaritime:
					body.searchType === "Marítimo" && body.maritimeType === "FCL",
			},
		});

		res.json({
			success: true,
			message: "Correo enviado correctamente.",
			result,
		});
	} catch (error) {
		console.error(error);
		res
			.status(500)
			.json({ success: false, error: "Error al enviar el correo." });
	}
});

app.get("/", (req, res) => {
	res.json({
		title: "API de Envío de Correos",
		description:
			"Esta es una API para enviar correos electrónicos usando Nodemailer y Handlebars.",
	});
});

app.listen(PORT, () => {
	console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
