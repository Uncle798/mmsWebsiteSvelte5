import { BOX_CLIENT_ID, BOX_CLIENT_SECRET, BOX_ENTERPRISE_ID, BOX_PASSPHRASE, BOX_PRIVATE_KEY_BASE64, BOX_USER_ID } from '$env/static/private';
import { BoxClient } from 'box-node-sdk';
import { BoxJwtAuth, JwtConfig } from 'box-node-sdk/box';

const config = new JwtConfig({
   clientId: BOX_CLIENT_ID,
   clientSecret: BOX_CLIENT_SECRET,
   jwtKeyId: '8495cr9l',
   privateKey: Buffer.from(BOX_PRIVATE_KEY_BASE64, 'base64').toString('ascii'),
   privateKeyPassphrase: BOX_PASSPHRASE,
   enterpriseId: BOX_ENTERPRISE_ID,
})
const jwtAuth = new BoxJwtAuth({config});
export const box = new BoxClient({ auth: jwtAuth }).withAsUserHeader(BOX_USER_ID);