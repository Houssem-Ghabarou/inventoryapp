"use client";

import { Document, Page, PDFViewer, Text, View } from "@react-pdf/renderer";
import { Table, TR, TH, TD } from "@ag-media/react-pdf-table";

import styles from "./Style";
import React from "react";
import { tableData, totalData } from "./data";

export default function Invoice({
  transaction,
  setTransaction,
  handleClose,
}: {
  transaction: any;
  setTransaction: React.Dispatch<React.SetStateAction<any>>;
  handleClose: () => void;
}) {
  console.log(transaction, "transaction in invoice");
  const InvoicePDF = () => (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={[styles.title, styles.textBold]}>Invoice</Text>
            <Text>Invoice N2024ref25</Text>
          </View>

          <View style={styles.SpaceY}>
            <Text style={styles.textBold}>CampanyNAme</Text>
            <Text>123 business Steet</Text>
            <Text>City State 12345</Text>
          </View>
        </View>
        <View style={[styles.SpaceY, styles.billTo]}>
          <Text style={styles.textBold}>ClientNAme</Text>
          <Text>Client Adresse </Text>
          <Text>city ,SateZape</Text>
        </View>
        {/* render table */}
        <Table style={styles.table}>
          <TH style={[styles.tableHeader, styles.textBold]}>
            <TD style={styles.td}>Description</TD>
            <TD style={styles.td}>Quantity</TD>
            <TD style={styles.td}>Unit Price</TD>
            <TD style={styles.td}>Total</TD>
          </TH>
          {tableData.map((item, index) => (
            <TR key={index}>
              <TD style={styles.td}>{item.description}</TD>
              <TD style={styles.td}>{item.quantity}</TD>
              <TD style={styles.td}>${item.unitPrice.toFixed(2)}</TD>
              <TD style={styles.td}>${item.total.toFixed(2)}</TD>
            </TR>
          ))}
        </Table>

        <View style={styles.totals}>
          <View
            style={{
              minWidth: "256px",
            }}
          >
            {totalData.map((item) => (
              <View
                key={item.label}
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginBottom: "8px",
                }}
              >
                <Text style={item.label === "Total" ? styles.textBold : {}}>
                  {item.label}
                </Text>
                <Text style={item.label === "Total" ? styles.textBold : {}}>
                  {item.value}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </Page>
    </Document>
  );
  return (
    <div>
      <div className="w-full h-[550px]">
        <PDFViewer width="100%" height="100%">
          <InvoicePDF />
        </PDFViewer>
      </div>
    </div>
  );
}
