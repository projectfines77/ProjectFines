const createPayload = (police) => {
  return { badgenumber: police.badgenumber, userID: police._id, role: police.role };
};

module.exports = createPayload;
