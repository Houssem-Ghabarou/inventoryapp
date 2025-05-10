"use client";

import {
  Document,
  Page,
  pdf,
  PDFViewer,
  Text,
  View,
} from "@react-pdf/renderer";
import { Table, TR, TH, TD } from "@ag-media/react-pdf-table";

import styles from "./Style";
import React from "react";
import { tableData, totalData } from "./data";
import { Download, Printer } from "lucide-react";

export default function Invoice({
  transaction,
  setTransaction,
  handleClose,
}: {
  transaction: any;
  setTransaction: React.Dispatch<React.SetStateAction<any>>;
  handleClose: () => void;
}) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-TN", {
      style: "currency",
      currency: "TND",
    }).format(amount);
  };
  const { data } = transaction;
  const { soldItems } = data;
  const { tripeItems } = data;
  console.log("tipeItemstipeItems", data);

  const InvoicePDF = () => (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={[styles.title, styles.textBold]}>
              {data?.type === "sale" ? "facture" : "Bon de sortie"}
            </Text>
            <Text>{transaction?.reference}</Text>
          </View>

          <View style={styles.SpaceY}>
            <Text style={styles.textBold}>STE HK BISCOTTA GROS</Text>
            <Text>Zgueg Elhoudi</Text>
            <Text>Menzel Bouzelfa 8010</Text>
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
          {data?.type === "sale"
            ? soldItems.map((item: any, index: number) => (
                <TR key={index}>
                  <TD style={styles.td}>{item?.name}</TD>
                  <TD style={styles.td}>{item?.quantity}</TD>
                  <TD style={styles.td}>{formatCurrency(item?.sellPrice)}</TD>
                  <TD style={styles.td}>
                    {formatCurrency(item?.sellPrice * item?.quantity)}
                  </TD>
                </TR>
              ))
            : data?.type === "departure"
            ? tripeItems.map((item: any, index: number) => (
                <TR key={index}>
                  <TD style={styles.td}>{item?.name}</TD>
                  <TD style={styles.td}>{item?.quantity}</TD>
                  <TD style={styles.td}>{formatCurrency(item?.sellPrice)}</TD>
                  <TD style={styles.td}>
                    {formatCurrency(item?.sellPrice * item?.quantity)}
                  </TD>
                </TR>
              ))
            : null}
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
  // Inside your component or a download function
  const downloadPDF = async () => {
    const blob = await pdf(<InvoicePDF />).toBlob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `facture-${transaction?.reference}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const printPDF = async () => {
    const blob = await pdf(<InvoicePDF />).toBlob();
    const url = URL.createObjectURL(blob);
    const newWindow = window.open(url, "_blank");
    newWindow?.print();
  };
  return (
    <div className="relative">
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
        <button onClick={downloadPDF}>
          <Download />
        </button>
        <button onClick={printPDF} className="ml-5">
          <Printer />
        </button>
      </div>
      <div className="w-full h-[600px]">
        <PDFViewer width="100%" height="100%">
          <InvoicePDF />
        </PDFViewer>
      </div>
    </div>
  );
}
