const createPayloadPolice = (police) => {
  return { badgenumber: police.badgenumber, policeMongoID: police._id, role: police.role };
};

const createPayloadUser = (police) => {
  return { badgenumber: police.badgenumber, policeMongoID: police._id, role: police.role };
};

module.exports = {createPayloadUser,createPayloadPolice};
