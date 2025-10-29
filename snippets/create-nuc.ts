import { Signer, Builder, Codec, Validator } from '@nillion/nuc';

// Step 1: Create Signers for different parties
// A root authority (e.g., for a server-side process with a private key)
const NILLION_PRIVATE_KEY_HEX = process.env.NILLION_PRIVATE_KEY_HEX!;
const rootSigner = Signer.fromPrivateKey(NILLION_PRIVATE_KEY_HEX);

// A user identity, newly generated for this session
const userSigner = Signer.generate();

// A service that will receive the final invocation
const serviceSigner = Signer.generate();