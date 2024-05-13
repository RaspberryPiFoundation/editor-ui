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
    console.log("from the thunk creating student", student);
    return await createStudent(student, schoolId, accessToken);
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
  builder.addCase("school/createStudent/fulfilled", (state, action) => {
    console.log("Student created successfully");
    return state;
  });
  builder.addCase("school/createStudent/rejected", (state, action) => {
    console.error("Error creating student", action.error);
    return state;
  });
};

export const reducers = {};
