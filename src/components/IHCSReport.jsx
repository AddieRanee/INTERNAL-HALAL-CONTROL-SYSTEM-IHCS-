// src/components/IHCSReport.jsx
import React from "react";
import {
  Page,
  Text,
  View,
  Document,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";

const safe = (v) => (v ? v : "[-]");
const pickOne = (arr) => (Array.isArray(arr) && arr.length > 0 ? arr[0] : null);

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
    fontFamily: "Helvetica",
    paddingTop: 60,
    paddingBottom: 60,
    paddingHorizontal: 50,
  },

  headerTable: {
    borderWidth: 1.2,
    borderColor: "#000",
    width: "100%",
    marginBottom: 25,
  },

  headerRow: {
    flexDirection: "row",
    borderBottomWidth: 1.2,
    borderColor: "#000",
    alignItems: "stretch",
  },

  logoCell: {
    width: "22%",
    borderRightWidth: 1.2,
    borderColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    padding: 6,
  },

  logo: {
    width: 55,
    height: 55,
    objectFit: "contain",
  },

  companyNameCell: {
    width: "35%",
    borderRightWidth: 1.2,
    borderColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    padding: 4,
    flexWrap: "wrap",
  },

  infoRightCell: {
    width: "43%",
    flexDirection: "column",
  },

  infoRow: {
    flexDirection: "row",
    borderBottomWidth: 1.2,
    borderColor: "#000",
    alignItems: "stretch",
    height: 22,
  },

  infoLabel: {
    width: "50%",
    borderRightWidth: 1.2,
    borderColor: "#000",
    fontSize: 9,
    fontWeight: "bold",
    paddingVertical: 4,
    paddingHorizontal: 5,
    textAlign: "left",
  },

  infoValue: {
    width: "50%",
    fontSize: 9,
    paddingVertical: 4,
    paddingHorizontal: 5,
    textAlign: "left",
  },

  bottomRow: {
    flexDirection: "row",
    borderTopWidth: 1.2,
    borderColor: "#000",
    alignItems: "stretch",
    minHeight: 25,
  },

  bottomLeft: {
    width: "57%",
    borderRightWidth: 1.2,
    borderColor: "#000",
    justifyContent: "center",
    paddingVertical: 5,
    paddingHorizontal: 10,
  },

  bottomMiddle: {
    width: "21.5%",
    borderRightWidth: 1.2,
    borderColor: "#000",
    justifyContent: "center",
    paddingVertical: 5,
    paddingHorizontal: 8,
  },

  bottomRight: {
    width: "21.5%",
    justifyContent: "center",
    paddingVertical: 5,
    paddingHorizontal: 8,
  },

  pageNoText: {
    fontSize: 9,
    textAlign: "left",
  },

  labelText: {
    fontSize: 9,
    fontWeight: "bold",
    flexWrap: "wrap",
  },

  normalText: {
    fontSize: 9,
    flexWrap: "wrap",
  },

  title: {
    textAlign: "center",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 40,
    letterSpacing: 0.6,
  },

  logoCover: {
    alignSelf: "center",
    marginVertical: 40,
    width: 220,
    height: 160,
    objectFit: "contain",
  },

  companyInfo: {
    textAlign: "center",
    fontSize: 13,
    fontWeight: "bold",
    lineHeight: 1.8,
    marginBottom: 100,
  },

  /* COVER PAGE */
  tableWrapper: {
    width: "95%",
    alignSelf: "center",
    borderWidth: 1.5,
    borderColor: "#000",
    flexDirection: "row",
    justifyContent: "center",
  },

  tableCol: {
    flex: 1,
    borderLeftWidth: 1.5,
    borderColor: "#000",
  },

  tableHeader: {
    borderBottomWidth: 1.5,
    borderColor: "#000",
    paddingVertical: 10,
    paddingHorizontal: 20,
    fontSize: 12,
    fontWeight: "bold",
    backgroundColor: "#f4f4f4",
  },

  tableCellCover: {
    fontSize: 12,
    paddingVertical: 10,
    paddingHorizontal: 20,
    textAlign: "left",
  },

  coverTable: {
    width: "95%",
    alignSelf: "center",
    borderWidth: 1.5,
    borderColor: "#000",
    flexDirection: "row",
    minHeight: 170,
  },

  coverCol: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderColor: "#000",
    borderRightWidth: 1.5,
  },

  coverHeader: {
    fontSize: 13,
    fontWeight: "bold",
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1.5,
    borderColor: "#000",
  },

  coverCell: {
    fontSize: 12,
    marginTop: 10,
  },

  /* TOC */
  tocMainTitle: {
    fontSize: 13,
    fontWeight: "bold",
    textAlign: "left",
    marginTop: 40,
    marginBottom: 15,
  },

  tocTable: {
    width: "100%",
  },

  tocHeaderRow: {
    flexDirection: "row",
    borderTopWidth: 1.5,
    borderBottomWidth: 1.5,
    borderColor: "#000",
    paddingVertical: 8,
  },

  tocHeaderNo: {
    width: "10%",
    fontSize: 11,
    fontWeight: "bold",
    textAlign: "center",
  },

  tocHeaderTitle: {
    width: "70%",
    fontSize: 11,
    fontWeight: "bold",
    textAlign: "left",
    paddingLeft: 10,
  },

  tocHeaderPage: {
    width: "20%",
    fontSize: 11,
    fontWeight: "bold",
    textAlign: "right",
  },

  tocRow: {
    flexDirection: "row",
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderColor: "#ccc",
  },

  tocNo: {
    width: "10%",
    fontSize: 10,
    textAlign: "center",
  },

  tocTitleText: {
    width: "70%",
    fontSize: 10,
    textAlign: "left",
    paddingLeft: 10,
  },

  tocPageText: {
    width: "20%",
    fontSize: 10,
    textAlign: "right",
  },

  centeredTitle: {
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 300,
  },

  sectionMainTitle: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    textDecoration: "underline",
    marginBottom: 20,
  },

  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginTop: 12,
    marginBottom: 4,
  },

  paragraph: {
    fontSize: 10,
    textAlign: "justify",
    lineHeight: 1.5,
    marginBottom: 8,
  },

  mapImage: {
    marginTop: 8,
    width: "80%",
    height: 200,
    alignSelf: "center",
    objectFit: "contain",
    borderWidth: 1,
    borderColor: "#ccc",
  },

  linkText: {
    fontSize: 10,
    color: "blue",
    textDecoration: "underline",
  },

  companyHeader: {
    alignItems: "center",
    marginBottom: 10,
  },

  smallLogo: {
    width: 60,
    height: 60,
    objectFit: "contain",
    marginBottom: 8,
  },

  companyNameText: {
    fontSize: 12,
    fontWeight: "bold",
  },

  ssmText: {
    fontSize: 10,
    marginBottom: 10,
  },

  /* PRODUCT LIST */
  productTableHeader: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#000",
    backgroundColor: "#e6e6e6",
  },

  productHeaderCell: {
    padding: 6,
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    borderRightWidth: 1,
    borderColor: "#000",
  },

  productRow: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#000",
  },

  productCell: {
    padding: 6,
    fontSize: 10,
    borderRightWidth: 1,
    borderColor: "#000",
  },

  colNoProduct: {
    width: "10%",
    textAlign: "center",
  },

  colProduct: {
    width: "30%",
  },

  colIngredients: {
    width: "60%",
    borderRightWidth: 0,
  },

  /* RAW MATERIAL MASTER */
  table: {
    display: "table",
    width: "100%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#000",
    marginTop: 10,
  },

  tableRowHeader: {
    flexDirection: "row",
    backgroundColor: "#e6e6e6",
    borderBottom: "1px solid #000",
  },

  tableRow: {
    flexDirection: "row",
    borderBottom: "1px solid #000",
  },

  tableHeaderCell: {
    flex: 1,
    padding: 4,
    fontSize: 8,
    fontWeight: "bold",
    borderRight: "1px solid #000",
  },

  tableCellRaw: {
    flex: 1,
    padding: 4,
    fontSize: 8,
    borderRight: "1px solid #000",
  },

  sopTitle: {
    fontSize: 11,
    fontWeight: "bold",
    marginTop: 6,
  },

  sopInput: {
    fontSize: 10,
    marginBottom: 4,
  },

  /* RAW MATERIAL SUMMARY */
  rawSummaryTableHeader: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#000",
    backgroundColor: "#e6e6e6",
  },

  rawSummaryHeaderCell: {
    padding: 6,
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    borderRightWidth: 1,
    borderColor: "#000",
  },

  rawSummaryRow: {
    flexDirection: "row",
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#000",
  },

  rawSummaryCell: {
    padding: 6,
    fontSize: 10,
    borderRightWidth: 1,
    borderColor: "#000",
  },

  colNoRaw: {
    width: "8%",
    textAlign: "center",
  },

  colMaterial: {
    width: "30%",
  },

  colSupplier: {
    width: "25%",
  },

  colCert: {
    width: "18%",
  },

  colExpiry: {
    width: "19%",
  },

  /* PROCESS FLOW */
  flowchartImage: {
    marginTop: 20,
    width: "80%",
    height: 300,
    alignSelf: "center",
    objectFit: "contain",
    borderWidth: 1,
    borderColor: "#ccc",
  },

  /* TRACEABILITY */
  traceImage: {
    width: "100%",
    height: 650,
    objectFit: "contain",
    marginTop: 10,
  },

  colNoTrace: {
    width: "8%",
    textAlign: "center",
    borderRightWidth: 1,
    borderColor: "#000",
  },

  referenceTitle: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
    marginBottom: 10,
  },

});


const IHCSReport = ({ allData = {}, meta = {} }) => {
  // ======= pull safe objects =======
  const info = allData.company_info?.[0] || {};
  const background = allData.company_background?.[0] || {};
  const orgChart = allData.organisation_chart?.[0] || {};
  const halalPolicy = allData.halal_policy?.[0] || {};
  const productList = allData.product_list || [];
  const rawMaterialMaster = allData.raw_material_master || [];
  const rawMaterialSummary = allData.raw_material_summary || [];
  const productFlowRaw = allData.product_flow_chart_raw?.[0] || {};
  const productFlowProcess = allData.product_flow_process?.[0] || {};
  const premise = allData.premise_plan?.[0] || {};
  const traceability = allData.traceability || [];

  // ======= Section-specific headers =======
  const companyBackgroundHeader = background;
  const organisationChartHeader = orgChart;
  const halalPolicyHeader = halalPolicy;

  // ======= NEW: Added all missing headers (fix crash) =======
  const productListHeader = productList?.[0] || {};
  const rawMaterialMasterHeader = rawMaterialMaster?.[0] || {};
  const rawMaterialSummaryHeader = rawMaterialSummary?.[0] || {};
  const productFlowRawHeader = productFlowRaw || {};
  const productFlowProcessHeader = productFlowProcess || {};
  const premisePlanHeader = premise || {};
  const traceabilityHeader = traceability?.[0] || {};

  // ======= FIXED HEADER RENDERER =======
  const renderHeader = (pageNumber, header = {}) => {
    const safeHeader = {
      implementation_date: header?.implementation_date
        ? new Date(header.implementation_date).toLocaleDateString("en-GB")
        : "No value",
      reference_no: header?.reference_no || "No value",
      review_no: header?.review_no || "No value",
      document_name: "IHCS/HAS",
    };

    const safeInfo = {
      company_logo_url: info?.company_logo_url || null,
      company_name: info?.company_name || "COMPANY NAME",
    };

    return (
      <View style={styles.headerTable} wrap={false}>
        <View style={styles.headerRow}>
          <View style={styles.logoCell}>
            {safeInfo.company_logo_url ? (
              <Image style={styles.logo} src={safeInfo.company_logo_url} />
            ) : (
              <Text style={styles.logoPlaceholder}>Logo</Text>
            )}
          </View>

          <View style={styles.companyNameCell}>
            <Text style={[styles.labelText, { fontSize: 10 }]}>
              {safeInfo.company_name.toUpperCase()}
            </Text>
          </View>

          <View style={styles.infoRightCell}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Implementation Date:</Text>
              <Text style={styles.infoValue}>{safeHeader.implementation_date}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Reference No / Doc No:</Text>
              <Text style={styles.infoValue}>{safeHeader.reference_no}</Text>
            </View>
            <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
              <Text style={styles.infoLabel}>Review No:</Text>
              <Text style={styles.infoValue}>{safeHeader.review_no}</Text>
            </View>
          </View>
        </View>

        <View style={styles.bottomRow}>
          <View style={styles.bottomLeft}>
            <Text style={[styles.documentNameText, { fontSize: 8 }]}>
              Document Name: IHCS/HAS
            </Text>
          </View>
          <View style={styles.bottomMiddle}>
            <Text style={styles.labelText}>Page No:</Text>
          </View>
          <View style={styles.bottomRight}>
            <Text style={styles.pageNoText}>{pageNumber}</Text>
          </View>
        </View>
      </View>
    );
  };

  // Calculate total staff based on table fields
const totalStaff =
  (organisationChartHeader.directors || 0) +
  (organisationChartHeader.managers || 0) +
  (organisationChartHeader.supervisors || 0) +
  (organisationChartHeader.employees || 0);


  // ======= RETURN DOCUMENT =======
  return (
    <Document>

{/* Cover */}
<Page size="A4" style={styles.page}>
  <Text style={styles.title}>INTERNAL HALAL CONTROL SYSTEM (IHCS)</Text>

  {info.company_logo_url ? (
    <Image style={styles.logoCover} src={info.company_logo_url} />
  ) : (
    <Text
      style={{
        textAlign: "center",
        fontSize: 12,
        color: "#999",
        marginBottom: 40,
      }}
    >
      COMPANY LOGO
    </Text>
  )}

  <View style={styles.companyInfo}>
    <Text>{info.company_name?.toUpperCase() || "COMPANY NAME"}</Text>
    <Text>({info.ssm_no || "SSM NO"})</Text>
    <Text>{info.address || "COMPANY ADDRESS"}</Text>
  </View>

  {/* Table */}
  <View style={styles.coverTable}>
    {/* Prepared By */}
    <View style={styles.coverCol}>
      <Text style={styles.coverHeader}>Prepared By</Text>
      <Text style={styles.coverCell}>Name: {info.prepared_by_name || ""}</Text>
      <Text style={styles.coverCell}>Position: {info.prepared_by_position || ""}</Text>
      <Text style={styles.coverCell}>
        Date: {info.prepared_date ? new Date(info.prepared_date).toLocaleDateString() : ""}
      </Text>
    </View>

    {/* Approved By */}
    <View style={[styles.coverCol, { borderRightWidth: 0 }]}>
      <Text style={styles.coverHeader}>Approved By</Text>
      <Text style={styles.coverCell}>Name: {info.approved_by_name || ""}</Text>
      <Text style={styles.coverCell}>Position: {info.approved_by_position || ""}</Text>
      <Text style={styles.coverCell}>
        Date: {info.approved_date ? new Date(info.approved_date).toLocaleDateString() : ""}
      </Text>
    </View>
  </View>
</Page>


{/* TABLE OF CONTENTS */}
<Page size="A4" style={styles.page}>
  {renderHeader(3, info)}
  <Text style={styles.tocMainTitle}>TABLE OF CONTENTS</Text>

  <View style={styles.tocTable}>
    
    {/* Header Row */}
    <View style={styles.tocHeaderRow}>
      <Text style={styles.tocHeaderNo}>NO.</Text>
      <Text style={styles.tocHeaderTitle}>TITLE</Text>
      <Text style={styles.tocHeaderPage}>PAGE</Text>
    </View>

    {/* Rows */}
    {[
      { title: "Company Background", page: 4 },
      { title: "Organisation Chart", page: 6 },
      { title: "Halal Policy", page: 8 },
      { title: "Product List", page: 10 },
      { title: "Raw Material Master", page: 12 },
      { title: "Raw Material Summary", page: 14 },
      { title: "Product Flow Chart Raw", page: 16 },
      { title: "Product Flow Process", page: 18 },
      { title: "Premise Plan", page: 20 },
      { title: "Traceability", page: 21 },
    ].map((item, i) => (
      <View key={i} style={styles.tocRow}>
        <Text style={styles.tocNo}>{i + 1}.</Text>
        <Text style={styles.tocTitleText}>{item.title}</Text>
        <Text style={styles.tocPageText}>{item.page}</Text>
      </View>
    ))}
  </View>
</Page>


      {/* COMPANY BACKGROUND — TITLE */}
      <Page size="A4" style={styles.page}>
        {renderHeader(4, companyBackgroundHeader)}
        <Text style={styles.centeredTitle}>1. Company Background</Text>
      </Page>

      {/* COMPANY BACKGROUND CONTENT */}
      <Page size="A4" style={styles.page}>
        {renderHeader(5, companyBackgroundHeader)}

        <Text style={styles.sectionMainTitle}>COMPANY BACKGROUND</Text>

        <Text style={styles.sectionTitle}>Company Establishment, Mission and Vision</Text>
        <Text style={styles.paragraph}>{background?.establishment_details || "N/A"}</Text>
        <Text style={styles.paragraph}>{background?.mission || "N/A"}</Text>
        <Text style={styles.paragraph}>{background?.vision || "N/A"}</Text>

        <Text style={styles.sectionTitle}>Business Activity</Text>
        <Text style={styles.paragraph}>{background?.business_activity || "N/A"}</Text>

        <Text style={styles.sectionTitle}>Management and Employees</Text>
        <Text style={styles.paragraph}>{background?.management_employees || "N/A"}</Text>

        <Text style={styles.sectionTitle}>Reason for Applying Halal Certification</Text>
        <Text style={styles.paragraph}>{background?.halal_certification_reason || "N/A"}</Text>

        <Text style={styles.sectionTitle}>Our Premise Location:</Text>
        {premise?.layout_image_url ? (
          <Image style={styles.mapImage} src={premise.layout_image_url} />
        ) : (
          <Text style={styles.paragraph}>No premise map provided.</Text>
        )}

        <Text style={styles.sectionTitle}>Google Map Link to Premise:</Text>
        <Text style={styles.linkText}>
          {background?.premise_location_map_url || "https://goo.gl/xxxxxxxxxxxxx"}
        </Text>
      </Page>

      {/* ORGANISATION CHART TITLE */}
<Page size="A4" style={styles.page}>
  {renderHeader(6, organisationChartHeader)}
  <Text style={styles.centeredTitle}>2. Organisation Chart</Text>
</Page>

{/* ORGANISATION CHART*/}
<Page size="A4" style={styles.page}>
  {renderHeader(7, organisationChartHeader)}
  <Text style={styles.sectionMainTitle}>ORGANISATION CHART</Text>

  {/* Description */}
  <Text style={styles.paragraph}>
    {organisationChartHeader.company_name || "This company"} is currently managed and 
    operated with a team of {totalStaff} employees;{" "}
    {organisationChartHeader.directors || 0} Directors,{" "}
    {organisationChartHeader.managers || 0} Managers,{" "}
    {organisationChartHeader.supervisors || 0} Supervisors and{" "}
    {organisationChartHeader.employees || 0} general employees.
  </Text>

  <Text style={styles.paragraph}>
    The organisation charts consist of:
    {"\n"}1. Company Organisation Chart (as a whole - if applicable)
    {"\n"}2. Subsidiary Organisation Chart (the premise intends to apply halal)
  </Text>

  <Text style={styles.paragraph}>
    To comply with the Malaysia Halal Certification requirements, our team 
    members consist of {organisationChartHeader.muslim_employees || 0} Muslim 
    employees who will operate, manage, determine and verify our Halal products.
  </Text>

  {/* Org Chart Image */}
  {organisationChartHeader.org_chart_url ? (
    <Image
      src={organisationChartHeader.org_chart_url}
      style={{ width: "100%", marginTop: 20 }}
    />
  ) : (
    <Text style={styles.paragraph}>[ Organisation Chart Image Not Available ]</Text>
  )}
</Page>


{/* HALAL POLICY TITLE PAGE */}
<Page size="A4" style={styles.page}>
  {renderHeader(8, halalPolicyHeader)}
  <Text style={styles.centeredTitle}>3. Halal Policy</Text>
</Page>

{/* HALAL POLICY CONTENT PAGE */}
<Page size="A4" style={styles.page}>
  {renderHeader(9, halalPolicyHeader)}

  {/* Company Header */}
  <View style={styles.companyHeader}>
    {info?.company_logo_url && (
      <Image style={styles.smallLogo} src={info.company_logo_url} />
    )}
    <Text style={styles.companyNameText}>
      {info?.company_name?.toUpperCase() || "COMPANY NAME"}
    </Text>
    <Text style={styles.ssmText}>({info?.ssm_no || "SSM NO"})</Text>
  </View>

  <Text style={styles.sectionMainTitle}>HALAL POLICY</Text>

  {/* Halal Policy Text & Points */}
  {(halalPolicy?.policy_text || halalPolicy?.policy_points?.length > 0) ? (
    <>
      {halalPolicy?.policy_text && (
        <Text style={styles.paragraph}>{halalPolicy.policy_text}</Text>
      )}

      {halalPolicy?.policy_points?.map((point, idx) => (
        <Text key={idx} style={styles.paragraph}>
          {idx + 1}. {point}
        </Text>
      ))}
    </>
  ) : (
    <Text style={styles.paragraph}>No halal policy data available.</Text>
  )}

  {/* Signature / Approval Section */}
  <View style={{ marginTop: 40, width: "60%" }}>
    <Text style={styles.paragraph}>……………………………………</Text>

    <Text style={styles.paragraph}>
      Name : {halalPolicy?.director_name || ""}
    </Text>

    <Text style={styles.paragraph}>
      Designation : {halalPolicy?.director_designation || ""}
    </Text>

    <Text style={styles.paragraph}>
      Date : {halalPolicy?.approval_date 
        ? new Date(halalPolicy.approval_date).toLocaleDateString("en-GB")
        : ""}
    </Text>
  </View>
</Page>

{/* PRODUCT LIST TITLE PAGE */}
<Page size="A4" style={styles.page}>
  {renderHeader(10, productListHeader)}
  <Text style={styles.centeredTitle}>PRODUCT LIST</Text>
</Page>

{/* PRODUCT LIST SUMMARY PAGE (No. & Product Name ONLY) */}
<Page size="A4" style={styles.page}>
  {renderHeader(11, productListHeader)}

  <Text style={styles.sectionMainTitle}>PRODUCT LIST SUMMARY</Text>

  {/* Table Header */}
  <View style={styles.productTableHeader}>
    <Text style={[styles.productHeaderCell, styles.colNo]}>
      No.
    </Text>

    <Text
      style={[
        styles.productHeaderCell,
        styles.colProduct,
        { flex: 1 }   // fill remaining width, removes ghost column
      ]}
    >
      Product Name
    </Text>
  </View>

  {/* Table Rows */}
  {productList.length > 0 ? (
    productList.map((prod, idx) => (
      <View key={prod?.id || idx} style={styles.productRow}>
        <Text style={[styles.productCell, styles.colNo]}>
          {idx + 1}
        </Text>

        <Text
          style={[
            styles.productCell,
            styles.colProduct,
            { flex: 1 }   // must match header
          ]}
        >
          {prod?.product_name || "N/A"}
        </Text>
      </View>
    ))
  ) : (
    <Text>No products found.</Text>
  )}
</Page>

{/* PRODUCT LIST PAGE */}
<Page size="A4" style={styles.page}>
  {renderHeader(12, productListHeader)}

  <Text style={styles.sectionMainTitle}>PRODUCT LIST</Text>

  {/* Table Header */}
  <View style={styles.productTableHeader}>
    <Text style={[styles.productHeaderCell, styles.colNo]}>
      No.
    </Text>

    <Text
      style={[
        styles.productHeaderCell,
        styles.colProduct,
        {
          flexGrow: 0,
          flexShrink: 0,
          maxWidth: 150,   // 👈 key fix
        }
      ]}
    >
      Product Name
    </Text>

    <Text
      style={[
        styles.productHeaderCell,
        styles.colIngredients,
        { flex: 1 }
      ]}
    >
      Ingredients
    </Text>
  </View>

  {/* Table Rows */}
  {productList.length > 0 ? (
    productList.map((prod, idx) => (
      <View key={prod?.id || idx} style={styles.productRow}>
        <Text style={[styles.productCell, styles.colNo]}>
          {idx + 1}
        </Text>

        <Text
          style={[
            styles.productCell,
            styles.colProduct,
            {
              flexGrow: 0,
              flexShrink: 0,
              maxWidth: 150,   // 👈 matches header
            }
          ]}
          wrap
        >
          {prod?.product_name || "N/A"}
        </Text>

        <Text
          style={[
            styles.productCell,
            styles.colIngredients,
            { flex: 1 }
          ]}
          wrap
        >
          {Array.isArray(prod?.ingredients_raw_materials)
            ? prod.ingredients_raw_materials.join(", ")
            : prod?.ingredients_raw_materials?.toString() || "N/A"}
        </Text>
      </View>
    ))
  ) : (
    <Text>No products found.</Text>
  )}
</Page>


{/* RAW MATERIAL MASTER TABLE (LANDSCAPE) */}
<Page size="A4" orientation="landscape" style={styles.page}>
  {renderHeader(12, rawMaterialMasterHeader)}
  <Text style={styles.sectionMainTitle}>RAW MATERIAL MASTER</Text>

  <View style={styles.table}>
    {/* HEADER */}
    <View style={styles.tableRowHeader}>
      <Text style={styles.tableHeaderCell}>Material Name</Text>
      <Text style={styles.tableHeaderCell}>Scientific / Brand Name</Text>
      <Text style={styles.tableHeaderCell}>Raw Material Source</Text>
      <Text style={styles.tableHeaderCell}>Manufacturer</Text>
      <Text style={styles.tableHeaderCell}>Material Declaration</Text>
      <Text style={styles.tableHeaderCell}>Halal Cert Body</Text>
      <Text style={styles.tableHeaderCell}>Expiry Date</Text>
    </View>

    {/* DATA */}
    {rawMaterialMaster?.length > 0 ? (
      rawMaterialMaster.map((item, idx) => (
        <View key={item?.id || idx} style={styles.tableRow}>

          <Text style={styles.tableCell}>{item?.raw_material_name || "N/A"}</Text>

          <Text style={styles.tableCell}>{item?.scientific_trade_name || "N/A"}</Text>

          <Text style={styles.tableCell}>{item?.source_of_raw_material || "N/A"}</Text>

          <Text style={styles.tableCell}>{item?.manufacturer_name_address || "N/A"}</Text>

          <Text style={styles.tableCell}>
            {item?.material_declaration_authorities ? "Yes" : "No"}
          </Text>

          <Text style={styles.tableCell}>{item?.halal_cert_body || "N/A"}</Text>

          <Text style={styles.tableCell}>
            {item?.halal_cert_expiry || "N/A"}
          </Text>

        </View>
      ))
    ) : (
      <Text style={styles.paragraph}>No raw material data available.</Text>
    )}
  </View>
</Page>

{/* RAW MATERIAL MASTER - SOP SECTION */}
<Page size="A4" style={styles.page}>
  {renderHeader(12, rawMaterialMasterHeader)}

  <Text style={styles.sectionMainTitle}>RAW MATERIAL MASTERLIST</Text>
  <Text style={styles.sectionMainTitle}>SOP - RAW MATERIAL</Text>

  {rawMaterialMaster?.length > 0 ? (
    rawMaterialMaster.map((item, idx) => (
      <View key={item?.id || idx} style={{ marginBottom: 14 }}>

        <Text style={styles.sopTitle}>Objective</Text>
        <Text style={styles.sopInput}>{item?.objective || "N/A"}</Text>

        <Text style={styles.sopTitle}>Scope</Text>
        <Text style={styles.sopInput}>{item?.scope || "N/A"}</Text>

        <Text style={styles.sopTitle}>Responsibilities</Text>
        <Text style={styles.sopInput}>{item?.responsibilities || "N/A"}</Text>

        <Text style={styles.sopTitle}>Frequency</Text>
        <Text style={styles.sopInput}>{item?.frequency || "N/A"}</Text>

        <Text style={styles.sopTitle}>Purchase</Text>
        <Text style={styles.sopInput}>{item?.purchase || "N/A"}</Text>

        <Text style={styles.sopTitle}>Receipt</Text>
        <Text style={styles.sopInput}>{item?.receipt || "N/A"}</Text>

        <Text style={styles.sopTitle}>Storage</Text>
        <Text style={styles.sopInput}>{item?.storage || "N/A"}</Text>

        <Text style={styles.sopTitle}>Record</Text>
        <Text style={styles.sopInput}>{item?.record || "N/A"}</Text>

      </View>
    ))
  ) : (
    <Text style={styles.paragraph}>No SOP data available.</Text>
  )}
</Page>


{/* RAW MATERIAL SUMMARY — TITLE PAGE */}
<Page size="A4" style={styles.page}>
  {renderHeader(14, rawMaterialSummaryHeader)}

  <Text style={styles.centeredTitle}>RAW MATERIAL SUMMARY</Text>
</Page>

{/* RAW MATERIAL SUMMARY*/}
<Page size="A4" style={styles.page}>
  {renderHeader(14, rawMaterialSummaryHeader)}

  <Text style={styles.sectionMainTitle}>RAW MATERIAL SUMMARY</Text>

  {/* TABLE HEADER */}
  <View style={styles.rawSummaryTableHeader}>
    <Text style={[styles.rawSummaryHeaderCell, styles.colNo]}>No.</Text>
    <Text style={[styles.rawSummaryHeaderCell, styles.colMaterial]}>Material Name</Text>
    <Text style={[styles.rawSummaryHeaderCell, styles.colSupplier]}>Supplier</Text>
    <Text style={[styles.rawSummaryHeaderCell, styles.colCert]}>Cert No.</Text>
    <Text style={[styles.rawSummaryHeaderCell, styles.colExpiry]}>Expiry Date</Text>
  </View>

  {/* TABLE BODY */}
  {rawMaterialSummary.length > 0 ? (
    rawMaterialSummary.map((item, idx) => (
      <View key={item?.id || idx} style={styles.rawSummaryRow}>
        <Text style={[styles.rawSummaryCell, styles.colNo]}>
          {idx + 1}
        </Text>

        <Text style={[styles.rawSummaryCell, styles.colMaterial]}>
          {item.material_name || "N/A"}
        </Text>

        <Text style={[styles.rawSummaryCell, styles.colSupplier]}>
          {item.supplier || "N/A"}
        </Text>

        <Text style={[styles.rawSummaryCell, styles.colCert]}>
          {item.cert_no || "N/A"}
        </Text>

        <Text style={[styles.rawSummaryCell, styles.colExpiry]}>
          {item.expiry_date || "N/A"}
        </Text>
      </View>
    ))
  ) : (
    <Text style={styles.paragraph}>No raw material summary data available.</Text>
  )}
</Page>


      {/* PRODUCT FLOW CHART RAW */}
      <Page size="A4" style={styles.page}>
        {renderHeader(16, productFlowRawHeader)}
        <Text style={styles.sectionMainTitle}>PRODUCT FLOW CHART (RAW)</Text>

        <Text style={styles.paragraph}>
          {productFlowRaw?.description || "No description provided."}
        </Text>

        {productFlowRaw?.flowchart_image_url ? (
          <Image style={styles.mapImage} src={productFlowRaw.flowchart_image_url} />
        ) : (
          <Text style={styles.paragraph}>No image provided.</Text>
        )}
      </Page>

      {/* PRODUCT FLOW PROCESS */}
<Page size="A4" style={styles.page}>
  {renderHeader(18, productFlowProcessHeader)}
  <Text style={styles.sectionMainTitle}>PRODUCT FLOW PROCESS</Text>

  {/* DESCRIPTION */}
  <Text style={styles.paragraph}>
    {productFlowProcess?.description || "No description provided."}
  </Text>

  {/* FLOWCHART IMAGE */}
  {productFlowProcess?.flowchart_image_url ? (
    <Image
      src={productFlowProcess.flowchart_image_url}
      style={styles.flowchartImage}
    />
  ) : (
    <Text style={styles.paragraph}>No flowchart image available.</Text>
  )}
</Page>


      {/* PREMISE PLAN */}
      <Page size="A4" style={styles.page}>
        {renderHeader(20, premisePlanHeader)}
        <Text style={styles.sectionMainTitle}>PREMISE PLAN</Text>

        {premise?.layout_image_url ? (
          <Image style={styles.mapImage} src={premise.layout_image_url} />
        ) : (
          <Text style={styles.paragraph}>No premise plan image provided.</Text>
        )}

        <Text style={[styles.sectionTitle, { marginTop: 12 }]}>Description</Text>
        <Text style={styles.paragraph}>
          {premise?.description || "No description provided."}
        </Text>
      </Page>

{/* TRACEABILITY TITLE PAGE */}
<Page size="A4" style={styles.page}>
  {renderHeader(21, traceabilityHeader)}
  <Text style={styles.centeredTitle}>TRACEABILITY</Text>
</Page>

{/* TRACEABILITY REFERENCE 1 PAGE */}
{traceability.length > 0 &&
  traceability.map((item, idx) => (
    <Page key={`ref1-${idx}`} size="A4" style={styles.page}>
      {renderHeader(22, traceabilityHeader)}

      <Text style={styles.referenceTitle}>REFERENCE 1</Text>

      {item?.file1_url ? (
        <Image style={styles.traceImageLarge} src={item.file1_url} />
      ) : (
        <Text style={styles.paragraph}>No Reference 1 file provided.</Text>
      )}
    </Page>
  ))
}

{/* TRACEABILITY REFERENCE 2 PAGE */}
{traceability.length > 0 &&
  traceability.map((item, idx) => (
    <Page key={`ref2-${idx}`} size="A4" style={styles.page}>
      {renderHeader(23, traceabilityHeader)}

      <Text style={styles.referenceTitle}>REFERENCE 2</Text>

      {item?.file2_url ? (
        <Image style={styles.traceImageLarge} src={item.file2_url} />
      ) : (
        <Text style={styles.paragraph}>No Reference 2 file provided.</Text>
      )}
    </Page>
  ))
}

    </Document>
  );
};

export default IHCSReport;
