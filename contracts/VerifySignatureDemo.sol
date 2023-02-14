// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.17;

/*
  0. message to sign
  1. hash(message)
  2. sign(hash(message), private key) | offchain
  3. ecrecover(hash(message), signature) == signer
*/

// How to use:
// open chrome console
// ethereum.enable()
// account = "metamask address"
// hash = "hashed message" (getMessageHash)
// ethereum.request({method: "personal_sign", params: [account, hash]})
// the promise result is the signature (signed message by address)
// verify by contract verify(signer"metamask address", _message"secret message", _sig"promise result signature")

contract VerifySignatureDemo {
  function verify(address _signer, string memory _message, bytes memory _sig) external pure returns (bool) {
    bytes32 messageHash = getMessageHash(_message);
    bytes32 ethSignedMessageHash = getEthSignedMessageHash(messageHash);
    return recover(ethSignedMessageHash, _sig) == _signer;
  }

  function getMessageHash(string memory _message) public pure returns (bytes32) {
    return keccak256(abi.encodePacked(_message));
  }

  function getEthSignedMessageHash(bytes32 _messageHash) public pure returns (bytes32) {
    return keccak256(abi.encodePacked(
      "\x19Ethereum Signed Message:\n32",
      _messageHash
    ));
  }

  function recover(bytes32 _ethSignedMessageHash, bytes memory _sig) public pure returns (address) {
    (bytes32 r, bytes32 s, uint8 v) = _split(_sig);
    return ecrecover(_ethSignedMessageHash, v, r, s);
  }

  // _sig is not the actual signature
  // it is a pointer to where the signature is store in memory
  function _split(bytes memory _sig) internal pure returns (bytes32 r, bytes32 s, uint8 v) {
    // 32 + 32 + 8 = 65
    require(_sig.length == 65, "invalid signature length");
    assembly {
      // The first 32 bytes from dynamic data types (like sig) store the length of the data
      // := reads "assign to"
      // this will go in memory from the pointer that we provide as input
      // add(_sig, 32) = We skip the first 32 bytes in memory because this is the length of the array/data
      r := mload(add(_sig, 32))
      // add(_sig, 64) = skip value of r and length of s
      s := mload(add(_sig, 64))
      // add(_sig, 64) = skip value of s
      // byte(0, mload(add(_sig, 96))) = get the first byte after the 96th byte
      v := byte(0, mload(add(_sig, 96)))
    }
  }
}
