const createPayload = (police) => {
  return { badgenumber: police.badgenumber, policeMongoID: police._id, role: police.role };
};

module.exports = createPayload;
