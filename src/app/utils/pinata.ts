require('dotenv').config();

const axios = require('axios');

const key = process.env.REACT_APP_PINATA_KEY;
const secret = process.env.REACT_APP_PINATA_SECRET;

export const pinJSONToIPFS = async (JSONBody: {name: string, image: string, description: string}) => {
    const url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;

    return axios
        .post(url, JSONBody, {
            headers: {
              pinata_api_key: key,
              pinata_secret_api_key: secret,
            }
        })
        .then(function (response) {
           return {
               success: true,
               pinataUrl: "https://gateway.pinata.cloud/ipfs/" + response.data.IpfsHash
           };
        })
        .catch(function (error: unknown) {
            console.log(error)
            return {
                success: false,
                message: (error as Error).message,
            }
    });
};