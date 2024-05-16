import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  createStudent,
  getSchool,
  getUserSchool,
} from "../../utils/apiCallHandler";

export const loadSchool = createAsyncThunk(
  `school/load`,
  async ({ id, accessToken }) => {
    if (id) {
      return await getSchool(id, accessToken);
    } else {
      return await getUserSchool(accessToken);
    }
  },
);

export const createNewStudent = createAsyncThunk(
  `school/createStudent`,
  async ({ student, schoolId, accessToken }) => {
    const response = await createStudent(student, schoolId, accessToken);
    return response.data;
  },
);

export const extraReducers = (builder) => {
  builder.addCase("school/load/pending", (state, action) => {
    return { ...state, loading: true };
  });
  builder.addCase("school/load/fulfilled", (state, action) => {
    return { ...state, ...action.payload, loading: false };
  });
  builder.addCase("school/load/rejected", (state, action) => {
    return { ...state, error: action.error, loading: false };
  });
};

export const reducers = {};
