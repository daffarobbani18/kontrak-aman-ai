const nodemailer = require("nodemailer");

async function test() {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: "d.robbani18@gmail.com",
      pass: "olwonffrokisxrcq",
    },
  });

  try {
    const info = await transporter.sendMail({
      from: '"Test Server" <d.robbani18@gmail.com>',
      to: "kipasanginkipasangin12345@gmail.com",
      subject: "Test SMTP KontrakAman",
      text: "Jika Anda menerima ini, maka SMTP berjalan dengan baik!",
    });
    console.log("Berhasil terkirim: " + info.messageId);
  } catch (error) {
    console.error("Gagal mengirim:", error);
  }
}

test();
