from hashlib import sha1, sha256, sha512

from deepsecrets.core.model.rules.hashing import HashingAlgorithm


def c_sha1(payload: str) -> str:
    return sha1(payload.encode('UTF-8')).hexdigest()


def c_sha256(payload: str) -> str:
    return sha256(payload.encode('UTF-8')).hexdigest()


def c_sha512(payload: str) -> str:
    return sha512(payload.encode('UTF-8')).hexdigest()


algorithm_to_method = {
    HashingAlgorithm.SHA_512: c_sha512,
    HashingAlgorithm.SHA_256: c_sha256,
    HashingAlgorithm.SHA_1: c_sha1
}


def get_hash(payload: str, algorithm: HashingAlgorithm) -> str:
    method = algorithm_to_method.get(algorithm)
    if method is None:
        raise Exception(f'Unable to calculate hash for algorithm {algorithm.name}')

    return method(payload)