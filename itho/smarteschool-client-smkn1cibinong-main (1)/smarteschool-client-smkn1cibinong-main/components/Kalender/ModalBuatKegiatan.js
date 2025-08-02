import { DatePicker, TimePicker } from "antd";
import { useEffect, useState } from "react";
import TextareaAutosize from "react-textarea-autosize";
import { toast } from "react-toastify";
import ReactiveButton from "reactive-button";
import {
  postKalenderKegiatan,
  putKalenderKegiatan,
} from "../../client/KalenderClient";
import { momentPackage } from "../../utilities/HelperUtils";
import { hideModal } from "../../utilities/ModalUtils";
import Editor from "../Shared/Editor/Editor";
import NewModal from "../Shared/NewModal/NewModal";
import SelectShared from "../Shared/SelectShared/SelectShared";

const initialFormData = {
  nama: "",
  tanggalMulai: momentPackage(),
  tanggalAkhir: momentPackage(),
  waktuMulai: momentPackage("00:00", "HH:mm"),
  waktuAkhir: momentPackage("00:00", "HH:mm"),
  media: "",
  tempat: "",
  link: "",
  bukuTamu: "",
  deskripsi: "",
};

const ModalBuatKegiatan = ({ _getKalenderData, editData }) => {
  const [formData, setFormData] = useState(initialFormData);
  const [dateError, setDateError] = useState("");

  const handleChangeInput = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleChangeDate = (dateString, key) => {
    const newFormData = {
      ...formData,
      [key]: dateString ? momentPackage(dateString) : "",
    };
    setFormData(newFormData);
    // Validasi tanggal
    if (
      key === "tanggalMulai" &&
      newFormData.tanggalAkhir &&
      dateString &&
      momentPackage(dateString).isAfter(momentPackage(newFormData.tanggalAkhir))
    ) {
      setDateError("Tanggal mulai harus sebelum atau sama dengan tanggal selesai.");
    } else if (
      key === "tanggalAkhir" &&
      newFormData.tanggalMulai &&
      dateString &&
      momentPackage(newFormData.tanggalMulai).isAfter(momentPackage(dateString))
    ) {
      setDateError("Tanggal mulai harus sebelum atau sama dengan tanggal selesai.");
    } else {
      setDateError("");
    }
  };

  const handleChangeTime = (value, key) => {
    setFormData({
      ...formData,
      [key]: momentPackage(value),
    });
  };

  const handleChangeRadio = (e, key, parseToNumber = false) => {
    setFormData({ ...formData, [key]: "" });
    setFormData({
      ...formData,
      [key]: parseToNumber ? parseInt(e.target.value) : e.target.value,
    });
  };

  const submitModal = async () => {
    // Validasi sebelum submit
    if (
      momentPackage(formData.tanggalMulai).isAfter(momentPackage(formData.tanggalAkhir))
    ) {
      setDateError("Tanggal mulai harus sebelum atau sama dengan tanggal selesai.");
      return;
    }
    let body = {
      ...formData,
      tanggalMulai: momentPackage(formData?.tanggalMulai).format("YYYY-MM-DD"),
      tanggalAkhir: momentPackage(formData?.tanggalAkhir).format("YYYY-MM-DD"),
      waktuMulai: momentPackage(formData?.waktuMulai).format("HH:mm"),
      waktuAkhir: momentPackage(formData?.waktuAkhir).format("HH:mm"),
    };

    const { data } =
      editData != null
        ? await putKalenderKegiatan(editData?.id, { ...body })
        : await postKalenderKegiatan(body);
    if (data) {
      toast.success(data?.message);
      hideModal("ModalBuatKegiatan");
      setFormData(initialFormData);
      window.location.reload();
      _getKalenderData();
    }
  };

  useEffect(() => {
    if (editData !== null && editData !== undefined) {
      setFormData({
        nama: editData?.nama || "",
        tanggalMulai: momentPackage(editData?.tanggalMulai || ""),
        tanggalAkhir: momentPackage(editData?.tanggalAkhir || ""),
        waktuMulai: editData?.waktuMulai
          ? momentPackage(editData?.waktuMulai, "HH:mm")
          : momentPackage("00:00", "HH:mm"),
        waktuAkhir: editData?.waktuAkhir
          ? momentPackage(editData?.waktuAkhir, "HH:mm")
          : momentPackage("00:00", "HH:mm"),
        media: editData?.media || "",
        tempat: editData?.tempat || "",
        link: editData?.link || "",
        bukuTamu: editData?.bukuTamu || "",
        deskripsi: editData?.deskripsi || "",
      });
    } else {
      setFormData(initialFormData);
    }
  }, [editData]);

  return (
    <NewModal
      modalId="ModalBuatKegiatan"
      modalSize="lg"
      title={
        <>
          <h4 className="mb-1 fw-extrabold">
            {editData != null ? "Edit" : "Tambah"} Kegiatan
          </h4>
          <span className="fs-6 fw-normal">
            Isi informasi dibawah untuk membuat kegiatan
          </span>
        </>
      }
      content={
        <>
          <div className="mb-4">
            <label className="form-label">Nama Kegiatan</label>
            <input
              className="form-control"
              autoComplete="off"
              placeholder="Tuliskan nama kegiatan"
              type="text"
              name="nama"
              value={formData.nama}
              onChange={handleChangeInput}
            />
          </div>
          <div className="row">
            <div className="col-md-6 mb-4">
              <label className="form-label">Tanggal Mulai</label>
              <DatePicker
                onChange={(date, dateString) =>
                  handleChangeDate(dateString, "tanggalMulai")
                }
                placeholder="dd / mm / yyyy"
                className="form-control"
                autoComplete="off"
                value={momentPackage(formData.tanggalMulai)}
                allowClear={false}
              />
            </div>
            <div className="col-md-6 mb-4">
              <label className="form-label">Tanggal Selesai</label>
              <DatePicker
                onChange={(date, dateString) =>
                  handleChangeDate(dateString, "tanggalAkhir")
                }
                placeholder="dd / mm / yyyy"
                className="form-control"
                autoComplete="off"
                value={momentPackage(formData.tanggalAkhir)}
                allowClear={false}
              />
            </div>
            {dateError && (
              <div className="col-12">
                <span style={{ color: "red", fontSize: "0.9rem" }}>{dateError}</span>
              </div>
            )}
          </div>
          <div className="row mb-3">
            <div className="col-md-6 mb-md-0 mb-3">
              <label className="form-label">Waktu Mulai</label>
              <TimePicker
                className="form-control"
                autoComplete="off"
                format="HH:mm"
                placeholder="-- : --"
                onChange={(date, dateString) =>
                  handleChangeTime(date, "waktuMulai")
                }
                value={momentPackage(formData?.waktuMulai)}
                allowClear={false}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Waktu Selesai</label>
              <TimePicker
                type="number"
                className="form-control"
                autoComplete="off"
                format="HH:mm"
                placeholder="-- : --"
                onChange={(date, dateString) =>
                  handleChangeTime(date, "waktuAkhir")
                }
                value={momentPackage(formData?.waktuAkhir)}
                allowClear={false}
              />
            </div>
          </div>

          <div className="row">
            <label className="form-label">Media Kegiatan</label>
            <div className="form-check-ss col-md-6 position-relative mb-4">
              <input
                className="form-check-input form-check-radio position-absolute"
                type="radio"
                id="media-bertemu-langsung"
                style={{
                  top: "36%",
                  left: "2em",
                }}
                value="Bertemu Langsung"
                checked={formData?.media === "Bertemu Langsung"}
                onChange={(e) => handleChangeRadio(e, "media")}
              />
              <label
                className="form-check-label rounded-ss w-100 border border-light-secondary-ss p-3"
                htmlFor="media-bertemu-langsung"
              >
                <span className="ms-4 ps-2">Bertemu Langsung</span>
              </label>
            </div>
            <div className="form-check-ss col-md-6 position-relative mb-4">
              <input
                className="form-check-input form-check-radio position-absolute"
                type="radio"
                id="media-meeting-online"
                style={{
                  top: "36%",
                  left: "2em",
                }}
                value="Meeting Online"
                checked={formData?.media === "Meeting Online"}
                onChange={(e) => handleChangeRadio(e, "media")}
              />
              <label
                className="form-check-label rounded-ss w-100 border border-light-secondary-ss p-3"
                htmlFor="media-meeting-online"
              >
                <span className="ms-4 ps-2">Meeting Online</span>
              </label>
            </div>
          </div>

          {formData?.media === "Bertemu Langsung" && (
            <div className="mb-4">
              <label className="form-label">Tempat Kegiatan</label>
              <input
                className="form-control"
                autoComplete="off"
                placeholder="Tuliskan tempat kegiatan berlangsung"
                type="text"
                name="tempat"
                value={formData.tempat}
                onChange={handleChangeInput}
              />
            </div>
          )}

          {formData?.media === "Meeting Online" && (
            <div className="mb-4">
              <label className="form-label">Link Meeting Online</label>
              <input
                className="form-control"
                autoComplete="off"
                placeholder="Masukkan link meeting online"
                type="text"
                name="link"
                value={formData.link}
                onChange={handleChangeInput}
              />
            </div>
          )}

          <div className="row">
            <label className="form-label">Menggunakan Buku Tamu</label>
            <div className="form-check-ss col-md-6 position-relative mb-4">
              <input
                className="form-check-input form-check-radio position-absolute"
                type="radio"
                id="buku-tamu-true"
                style={{
                  top: "36%",
                  left: "2em",
                }}
                value={1}
                checked={formData.bukuTamu === 1}
                onChange={(e) => handleChangeRadio(e, "bukuTamu", true)}
              />
              <label
                className="form-check-label rounded-ss w-100 border border-light-secondary-ss p-3"
                htmlFor="buku-tamu-true"
              >
                <span className="ms-4 ps-2">Ya</span>
              </label>
            </div>
            <div className="form-check-ss col-md-6 position-relative mb-4">
              <input
                className="form-check-input form-check-radio position-absolute"
                type="radio"
                id="buku-tamu-false"
                style={{
                  top: "36%",
                  left: "2em",
                  // height: "20px",
                }}
                value={0}
                checked={formData.bukuTamu === 0}
                onChange={(e) => handleChangeRadio(e, "bukuTamu", true)}
              />
              <label
                className="form-check-label rounded-ss w-100 border border-light-secondary-ss p-3"
                htmlFor="buku-tamu-false"
              >
                <span className="ms-4 ps-2">Tidak</span>
              </label>
            </div>
            <div className="mb-4">
              <label htmlFor="#pesanKepsek" className="form-label">
                Deskripsi Kegiatan
              </label>
              <TextareaAutosize
                className="form-control"
                autoComplete="off"
                style={{
                  resize: "none",
                  width: "100%",
                }}
                placeholder="Tuliskan deskripsi kegiatan"
                minRows={3}
                name="deskripsi"
                onChange={handleChangeInput}
                value={formData.deskripsi}
              />
            </div>
          </div>
        </>
      }
      submitButton={
        <ReactiveButton
          buttonState="idle"
          onClick={submitModal}
          color={"primary"}
          idleText="Buat Kegiatan"
          loadingText={"Diproses"}
          successText={"Berhasil"}
          errorText={"Gagal"}
          type={"button"}
          data-bs-dismiss="modal"
          className={"btn btn-primary"}
        />
      }
    />
  );
};

export default ModalBuatKegiatan;
