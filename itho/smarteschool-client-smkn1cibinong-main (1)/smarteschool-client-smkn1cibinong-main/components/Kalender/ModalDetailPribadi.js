import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import ReactiveButton from "reactive-button";
import swal from "sweetalert";
import { hideModal, showModal } from "utilities/ModalUtils";
import {
  deleteKalenderPribadi,
  getDetailKalenderPribadi,
  getKalenderData,
} from "../../client/KalenderClient";
import { momentPackage } from "../../utilities/HelperUtils";
import NewModal from "../Shared/NewModal/NewModal";

const ModalDetailPribadi = ({
  id,
  _getKalenderData,
  setEditDataPribadi,
  modalId = "ModalDetailPribadi",
}) => {
  const [calendarData, setCalendarData] = useState(null);
  const [labelName, setLabelName] = useState("Kalender Pribadi");
  const [labelColor, setLabelColor] = useState("#eee");
  const [loading, setLoading] = useState(false);
  const [labelList, setLabelList] = useState([]);

  const getData = async (calendarId) => {
    setLoading(true);
    setCalendarData(null);
    setLabelName("Kalender Pribadi");
    setLabelColor("#eee");

    try {
      const { data } = await getDetailKalenderPribadi(Number(calendarId));
      console.log("[DEBUG] Response getDetailKalenderPribadi:", data);

      // PERBAIKI DI SINI: data bisa berupa objek langsung, bukan data.kalender
      const kalender = data.kalender ? data.kalender : data;

      if (kalender && kalender.id) {
        setCalendarData(kalender);

        try {
          const labelRes = await getKalenderData();
          const labels = labelRes?.data?.label || [];
          setLabelList(labels);

          // Ambil id label dari field "warna"
          // (warna = id label, seperti "3105")
          const idLabel = kalender.warna;
          const foundLabel = labels.find(l => String(l.id) === String(idLabel));
          console.log("[DEBUG] idLabel:", idLabel);
          console.log("[DEBUG] foundLabel:", foundLabel);

          setLabelName(foundLabel ? foundLabel.nama : "Kalender Pribadi");
          setLabelColor(foundLabel ? foundLabel.warna : "#eee");
        } catch (err) {
          console.log("[DEBUG] Error getKalenderData:", err);
          setLabelName("Kalender Pribadi");
          setLabelColor("#eee");
        }
      } else {
        console.log("[DEBUG] Data kalender pribadi kosong/undefined:", data);
        setCalendarData(null);
        setLabelName("Kalender Pribadi");
        setLabelColor("#eee");
      }
    } catch (e) {
      console.log("[DEBUG] Error getDetailKalenderPribadi:", e);
      setCalendarData(null);
      setLabelName("Kalender Pribadi");
      setLabelColor("#eee");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (id && !isNaN(Number(id))) {
      getData(id);
    } else {
      setCalendarData(null);
      setLabelName("Kalender Pribadi");
      setLabelColor("#eee");
    }
  }, [id]);

  const _deleteKalenderPribadi = (calendarId) => {
    swal({
      title: "Yakin ingin dihapus?",
      text: "Perhatikan kembali data yang ingin anda hapus",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    }).then(async (willDelete) => {
      if (willDelete) {
        const { data, error } = await deleteKalenderPribadi(calendarId);
        if (data) {
          toast.success(data?.message);
          hideModal(modalId);
          _getKalenderData();
        } else {
          toast.error(error?.message);
        }
      }
    });
  };

  // --- Bagian render --- //
  return (
    <NewModal
      modalId={modalId}
      modalSize="md"
      whiteBackgroundHeader
      removeButtonClose
      title={
        <>
          <div
            className="label-ss fs-12-ss fw-bold rounded-pill"
            style={{ backgroundColor: labelColor }}
          >
            {labelName}
          </div>
        </>
      }
      content={
        loading ? (
          "Memuat data..."
        ) : calendarData ? (
          <>
            <h3 className="color-dark fw-extrabold">{calendarData.nama}</h3>
            <div className="d-flex align-items-center">
              <img src="/img/icon-tanggal.svg" alt="Tanggal" />
              <span className="color-primary ms-2">
                {(calendarData.tanggalAwal || calendarData.tanggal_awal) &&
                  (calendarData.tanggalAkhir || calendarData.tanggal_akhir)
                  ? momentPackage(calendarData.tanggalAwal || calendarData.tanggal_awal).format("dddd, DD MMMM YYYY") ===
                    momentPackage(calendarData.tanggalAkhir || calendarData.tanggal_akhir).format("dddd, DD MMMM YYYY")
                    ? momentPackage(calendarData.tanggalAwal || calendarData.tanggal_awal).format("dddd, DD MMMM YYYY")
                    : `${momentPackage(calendarData.tanggalAwal || calendarData.tanggal_awal).format("dddd, DD MMMM YYYY")} - ${momentPackage(calendarData.tanggalAkhir || calendarData.tanggal_akhir).format("dddd, DD MMMM YYYY")}`
                  : "-"
                }
              </span>
            </div>
            {/* Kolom Deskripsi */}
            <div className="mt-4">
              <span className="text-muted fw-bold d-block mb-1">Deskripsi:</span>
              <div>{calendarData.deskripsi || <span className="fst-italic text-muted">-</span>}</div>
            </div>
          </>
        ) : (
          "Data tidak ditemukan."
        )
      }
      aksiButton={
        <>
          <ReactiveButton
            onClick={() => {
              if (calendarData && typeof setEditDataPribadi === "function") {
                setEditDataPribadi(calendarData);
                hideModal(modalId);
                showModal("ModalBuatKalenderPribadi");
              }
            }}
            color={"primary"}
            idleText={"Edit"}
            loadingText={"Diproses"}
            successText={"Berhasil"}
            errorText={"Gagal"}
            type={"button"}
            className={"btn btn-primary me-3"}
            disabled={!calendarData}
          />
          <ReactiveButton
            onClick={() => _deleteKalenderPribadi(calendarData?.id)}
            color={"primary"}
            idleText={"Hapus"}
            loadingText={"Diproses"}
            successText={"Berhasil"}
            errorText={"Gagal"}
            type={"button"}
            data-bs-dismiss="modal"
            className={"btn btn-danger-ss rounded-pill ms-2"}
            disabled={!calendarData}
          />
        </>
      }
    />
  );
};

export default ModalDetailPribadi;
