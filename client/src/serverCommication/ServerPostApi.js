export const checkUserDetails = async (serverIp, userDet) => {
  try {
    const response = await fetch(
      serverIp + "/api/loginDetails",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userDet),
      }
    );
    const jsonData = await response.json();
    return jsonData;
  } catch (e) {
    console.log(e.message);
    return e.message;
  }
};


export const getSelectedCompany = async (serverIp) => {
  try {

    const response = await fetch(
      serverIp + "/api/getSelectedCompany",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(),
      }
    );
    const jsonData = await response.json();
    return jsonData;
  } catch (e) {
    console.log(e.message);
    return e.message;
  }
};

export const getFabricApproval = async (serverIp, data) => {
  try {

    const response = await fetch(
      serverIp + "/api/getFabricApproval",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );
    const jsonData = await response.json();
    return jsonData;
  } catch (e) {
    console.log(e.message);
    return e.message;
  }
};


export const insertFabricApproval = async (serverIp, data) => {
  try {
    const response = await fetch(
      serverIp + "/api/insertFabricApproval",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );
    const jsonData = await response.json();
    return jsonData;
  } catch (e) {
    console.log(e.message);
    return e.message;
  }
};


export const rejectFabricApproval = async (serverIp, userDet) => {
  try {
    const response = await fetch(
      serverIp + "/api/rejectFabricApproval",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userDet),
      }
    );
    const jsonData = await response.json();
    return jsonData;
  } catch (e) {
    console.log(e.message);
    return e.message;
  }
};








