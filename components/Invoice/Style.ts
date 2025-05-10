import React from "react";
import { Page, Text, View, Document, StyleSheet } from "@react-pdf/renderer";
import { headers } from "next/headers";
import { title } from "process";

// Create styles
const styles = StyleSheet.create({
  page: {
    backgroundColor: "#fff",
    color: "#262626",
    fontFamily: "Helvetica",
    fontSize: 12,
    // padding: "30px 50px",
    // paddingBottom: 100,
    paddingRight: 50,
    paddingLeft: 50,
    paddingTop: 30,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
  },
  textBold: {
    fontWeight: "bold",
  },
  SpaceY: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },
  billTo: {
    marginBottom: 5,
  },
  table: {
    width: "100%",
    borderColor: "1px solid #f3f4f6",
    margin: "20px 0",
  },
  tableHeader: {
    backgroundColor: "#e5e5e5",
  },
  td: {
    padding: 6,
  },
  totals: {
    display: "flex",
    alignItems: "flex-end",
  },
});
export default styles;
