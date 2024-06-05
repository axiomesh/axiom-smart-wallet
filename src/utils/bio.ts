import { checkPasskeyCreate, checkPasskey } from "@/services/login";
import { client } from '@passwordless-id/webauthn';

export const bioPay = async (email: string, credential_id: string, credential_publicKey: string) => {
    const create = await checkPasskeyCreate({email, credential_id, credential_publicKey});
    const challenge = "56535b13-5d93-4194-a282-f234c1c24500"
    const authentication = await client.authenticate(["3924HhJdJMy_svnUowT8eoXrOOO6NLP8SK85q2RPxdU"], challenge, {
        "authenticatorType": "auto",
        "userVerification": "required",
        "timeout": 60000
    })
    await checkPasskey({
        email: email,
        result: authentication,
        sign: "",
        sign_algorithm: ""
    })
}