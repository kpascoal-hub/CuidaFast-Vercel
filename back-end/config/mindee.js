import * as mindee from "mindee";


const apiKey = process.env.MINDEE_API_KEY || "md_WV5FiUOnyhAdmZV8yrgqtfHuZqbQ6zZV";


const mindeeClient = new mindee.ClientV2({ apiKey });

export default mindeeClient;

