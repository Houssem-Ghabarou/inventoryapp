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
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-TN", {
      style: "currency",
      currency: "TND",
    }).format(amount);
  };
  const { data } = transaction;
  const { soldItems } = data;
  console.log(data, "dataaaaaa");
  const InvoicePDF = () => (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={[styles.title, styles.textBold]}>Facture</Text>
            <Text>{transaction?.reference}</Text>
          </View>

          <View style={styles.SpaceY}>
            <Text style={styles.textBold}>CampanyNAme</Text>
            <Text>123 business Steet</Text>
            <Text>City State 12345</Text>
          </View>
        </View>
        {/* render table */}
        <Table style={styles.table}>
          <TH style={[styles.tableHeader, styles.textBold]}>
            <TD style={styles.td}>Produit</TD>
            <TD style={styles.td}>Quantité</TD>
            <TD style={styles.td}>P.U</TD>
            <TD style={styles.td}>Total</TD>
          </TH>
          {soldItems.map((item, index) => (
            <TR key={index}>
              <TD style={styles.td}>{item?.name}</TD>
              <TD style={styles.td}>{item?.quantity}</TD>
              <TD style={styles.td}>{formatCurrency(item?.sellPrice)}</TD>
              <TD style={styles.td}>{formatCurrency(item?.value)}</TD>
            </TR>
          ))}
        </Table>
        <View style={styles.totals}>
          <View
            style={{
              minWidth: "256px",
              flexDirection: "row",
              justifyContent: "space-between",
              marginTop: 8,
            }}
          >
            <Text style={styles.textBold}>Total</Text>
            <Text style={styles.textBold}>
              {formatCurrency(data?.totalSellPrice || 0)}
            </Text>
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
