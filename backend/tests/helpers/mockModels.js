const mockState = {
  patientFindOne: null,
  patientCreate: null,
  doctorFindOne: null,
  doctorCreate: null,
  adminFindOne: null,
};

const Patient = {
  findOne: jest.fn(async () => mockState.patientFindOne),
  create: jest.fn(async (data) => {
    if (mockState.patientCreate) return mockState.patientCreate;
    return {
      id: 101,
      ...data,
      update: jest.fn(async function update(values) {
        Object.assign(this, values);
        return this;
      }),
    };
  }),
};

const Doctor = {
  findOne: jest.fn(async () => mockState.doctorFindOne),
  create: jest.fn(async (data) => {
    if (mockState.doctorCreate) return mockState.doctorCreate;
    return {
      id: 202,
      ...data,
      update: jest.fn(async function update(values) {
        Object.assign(this, values);
        return this;
      }),
    };
  }),
};

const Admin = {
  findOne: jest.fn(async () => mockState.adminFindOne),
};

const __setMockState = (nextState = {}) => {
  Object.assign(mockState, nextState);
};

const __resetMockState = () => {
  mockState.patientFindOne = null;
  mockState.patientCreate = null;
  mockState.doctorFindOne = null;
  mockState.doctorCreate = null;
  mockState.adminFindOne = null;
  Patient.findOne.mockClear();
  Patient.create.mockClear();
  Doctor.findOne.mockClear();
  Doctor.create.mockClear();
  Admin.findOne.mockClear();
};

module.exports = {
  Patient,
  Doctor,
  Admin,
  __setMockState,
  __resetMockState,
};
