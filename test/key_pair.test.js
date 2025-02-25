
const nearApi = require('../src/index');
const { sha256 } = require('js-sha256');

test('test sign and verify', async () => {
    const keyPair = new nearApi.utils.key_pair.KeyPairEd25519('26x56YPzPDro5t2smQfGcYAPy3j7R2jB2NUb7xKbAGK23B6x4WNQPh3twb6oDksFov5X8ts5CtntUNbpQpAKFdbR');
    expect(keyPair.publicKey.toString()).toEqual('ed25519:AYWv9RAN1hpSQA4p1DLhCNnpnNXwxhfH9qeHN8B4nJ59');
    const message = new Uint8Array(sha256.array('message'));
    const signature = keyPair.sign(message);
    expect(nearApi.utils.serialize.base_encode(signature.signature)).toEqual('26gFr4xth7W9K7HPWAxq3BLsua8oTy378mC1MYFiEXHBBpeBjP8WmJEJo8XTBowetvqbRshcQEtBUdwQcAqDyP8T');
});

test('test sign and verify with random', async () => {
    const keyPair = nearApi.utils.key_pair.KeyPairEd25519.fromRandom();
    const message = new Uint8Array(sha256.array('message'));
    const signature = keyPair.sign(message);
    expect(keyPair.verify(message, signature.signature)).toBeTruthy();
});

test('test sign and verify with public key', async () => {
    const keyPair = new nearApi.utils.key_pair.KeyPairEd25519('5JueXZhEEVqGVT5powZ5twyPP8wrap2K7RdAYGGdjBwiBdd7Hh6aQxMP1u3Ma9Yanq1nEv32EW7u8kUJsZ6f315C');
    const message = new Uint8Array(sha256.array('message'));
    const signature = keyPair.sign(message);
    const publicKey = nearApi.utils.key_pair.PublicKey.from('ed25519:EWrekY1deMND7N3Q7Dixxj12wD7AVjFRt2H9q21QHUSW');
    expect(publicKey.verify(message, signature.signature)).toBeTruthy();
});

test('test from secret', async () => {
    const keyPair = new nearApi.utils.key_pair.KeyPairEd25519('5JueXZhEEVqGVT5powZ5twyPP8wrap2K7RdAYGGdjBwiBdd7Hh6aQxMP1u3Ma9Yanq1nEv32EW7u8kUJsZ6f315C');
    expect(keyPair.publicKey.toString()).toEqual('ed25519:EWrekY1deMND7N3Q7Dixxj12wD7AVjFRt2H9q21QHUSW');
});

test('convert to string', async () => {
    const keyPair = nearApi.utils.key_pair.KeyPairEd25519.fromRandom();
    const newKeyPair = nearApi.utils.key_pair.KeyPair.fromString(keyPair.toString());
    expect(newKeyPair.secretKey).toEqual(keyPair.secretKey);

    const keyString = 'ed25519:2wyRcSwSuHtRVmkMCGjPwnzZmQLeXLzLLyED1NDMt4BjnKgQL6tF85yBx6Jr26D2dUNeC716RBoTxntVHsegogYw';
    const keyPair2 = nearApi.utils.key_pair.KeyPair.fromString(keyString);
    expect(keyPair2.toString()).toEqual(keyString);
});

test('test encrypt and decrypt message', async () => {
    const senderKeypair = new nearApi.utils.key_pair.KeyPairEd25519('5JueXZhEEVqGVT5powZ5twyPP8wrap2K7RdAYGGdjBwiBdd7Hh6aQxMP1u3Ma9Yanq1nEv32EW7u8kUJsZ6f315C');
    const receiverKeypair = new nearApi.utils.key_pair.KeyPairEd25519('26x56YPzPDro5t2smQfGcYAPy3j7R2jB2NUb7xKbAGK23B6x4WNQPh3twb6oDksFov5X8ts5CtntUNbpQpAKFdbR');

    const message = new Uint8Array([0x1, 0x2, 0x3, 0x4, 0x5, 0x6]);
    const encryptedMessage = senderKeypair.encryptMessage(message, receiverKeypair.publicKey);

    const decryptedMessage = receiverKeypair.decryptMessage(encryptedMessage);
    expect(decryptedMessage).toEqual(message);
});

test('fail to decrypt message - wrong privateKey', async () => {
    const senderKeypair = new nearApi.utils.key_pair.KeyPairEd25519('5JueXZhEEVqGVT5powZ5twyPP8wrap2K7RdAYGGdjBwiBdd7Hh6aQxMP1u3Ma9Yanq1nEv32EW7u8kUJsZ6f315C');
    const receiverKeypair = new nearApi.utils.key_pair.KeyPairEd25519('26x56YPzPDro5t2smQfGcYAPy3j7R2jB2NUb7xKbAGK23B6x4WNQPh3twb6oDksFov5X8ts5CtntUNbpQpAKFdbR');

    const message = new Uint8Array([0x1, 0x2, 0x3, 0x4, 0x5, 0x6]);
    const encryptedMessage = senderKeypair.encryptMessage(message, receiverKeypair.publicKey);

    // Wrong private key - receiverKeypair should be used to decrypt
    const decryptedMessage = senderKeypair.decryptMessage(encryptedMessage);
    expect(decryptedMessage).toEqual(null);
});

test('test encrypt and decrypt message - send to self', async () => {
    const senderKeypair = new nearApi.utils.key_pair.KeyPairEd25519('5JueXZhEEVqGVT5powZ5twyPP8wrap2K7RdAYGGdjBwiBdd7Hh6aQxMP1u3Ma9Yanq1nEv32EW7u8kUJsZ6f315C');

    const message = new Uint8Array([0x1, 0x2, 0x3, 0x4, 0x5, 0x6]);
    const encryptedMessage = senderKeypair.encryptMessage(message, senderKeypair.publicKey);

    // decrypt the message yourself
    const decryptedMessage = senderKeypair.decryptMessage(encryptedMessage);
    expect(decryptedMessage).toEqual(message);
});