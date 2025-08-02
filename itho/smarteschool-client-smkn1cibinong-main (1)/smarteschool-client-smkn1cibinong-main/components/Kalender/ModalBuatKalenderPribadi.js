import { DatePicker } from "antd";
import React, { useState, useEffect } from "react";
import ReactiveButton from "reactive-button";
import toast from "react-hot-toast";
import { hideModal } from "utilities/ModalUtils";
import { momentPackage } from "../../utilities/HelperUtils";
import NewModal from "../Shared/NewModal/NewModal";
import { postKalenderPribadi, putKalenderPribadi, getKalenderData } from "../../client/KalenderClient";
import SelectShared from "../Shared/SelectShared/SelectShared";

const initialFormData = {
  nama: "",
  tanggal_awal: null,
  tanggal_akhir: null,
  deskripsi: "",
  mLabelKalenderId: "",
  user_id: "",
  warna: "",
};


// Helper untuk decode JWT
function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
}

// Helper untuk ambil user id dari ss-token di localStorage, fallback ke cara lama
function getUserId(propsUserId) {
  if (propsUserId) return propsUserId;
  if (typeof window !== "undefined") {
    // Ambil dari ss-token
    const ssToken = window.localStorage && window.localStorage.getItem("ss-token");
    if (ssToken) {
      const payload = parseJwt(ssToken);
      if (payload && payload.uid) return payload.uid;
    }
    // Fallback ke cara lama
    if (window.user && window.user.id) return window.user.id;
    if (window.localStorage && window.localStorage.getItem("user_id")) return window.localStorage.getItem("user_id");
    if (window.sessionStorage && window.sessionStorage.getItem("user_id")) return window.sessionStorage.getItem("user_id");
    // Cek cookie (jika ada user_id di cookie)
    const match = document.cookie.match(/(?:^|;\s*)user_id=([^;]*)/);
    if (match) return match[1];
  }
  return null;
}

const ModalBuatKalenderPribadi = ({ _getKalenderData, userId: propsUserId, editData, setEditData }) => {
  const [formData, setFormData] = useState(initialFormData);
  const [buttonState, setButtonState] = useState("idle");
  const [dateError, setDateError] = useState("");
  const [listLabel, setListLabel] = useState([]);

  useEffect(() => {
    const fetchLabel = async () => {
      const { data } = await getKalenderData();
      if (data) setListLabel(data?.label || []);
    };
    fetchLabel();
  }, []);

  // Jika editData berubah (misal: klik edit di modal detail), set formData sesuai editData
  useEffect(() => {
    if (editData) {
      setFormData({
        nama: editData.nama || "",
        tanggal_awal: editData.tanggal_awal ? momentPackage(editData.tanggal_awal) : null,
        tanggal_akhir: editData.tanggal_akhir ? momentPackage(editData.tanggal_akhir) : null,
        deskripsi: editData.deskripsi || "",
        mLabelKalenderId: editData.warna || "",
        user_id: editData.user_id || "",
        warna: editData.warna || "",
      });
    } else {
      setFormData(initialFormData);
    }
  }, [editData]);


  const optionLabel =
    (listLabel?.length > 0 &&
      listLabel?.map((label) => ({
        label: label?.nama,
        value: label?.id,
        warna: label?.warna,
      }))) ||
    [];

  const handleChangeInput = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleChangeDate = (e, key) => {
    const value = e.target.value;
    const newFormData = { ...formData, [key]: value };
    setFormData(newFormData);

    // Validasi tanggal
    if (
      key === "tanggal_awal" &&
      newFormData.tanggal_akhir &&
      value &&
      momentPackage(value).isAfter(momentPackage(newFormData.tanggal_akhir))
    ) {
      setDateError("Tanggal mulai harus sebelum atau sama dengan tanggal selesai.");
    } else if (
      key === "tanggal_akhir" &&
      newFormData.tanggal_awal &&
      value &&
      momentPackage(newFormData.tanggal_awal).isAfter(momentPackage(value))
    ) {
      setDateError("Tanggal mulai harus sebelum atau sama dengan tanggal selesai.");
    } else {
      setDateError("");
    }
  };

  const handleChangeLabel = (e) => {
    const selected = optionLabel.find((opt) => opt.value === e.value);
    setFormData({
      ...formData,
      mLabelKalenderId: e.value,
      warna: selected ? selected.warna : "",
    });
  };

  // Ambil user id dari berbagai sumber
  const userId = getUserId(propsUserId);

  const submitModal = async () => {
    if (dateError) return;
    setButtonState("loading");

    if (!userId) {
      toast.error("User ID tidak ditemukan. Silakan login ulang.");
      setButtonState("idle");
      return;
    }

    const payload = {
      user_id: userId,
      nama: formData.nama,
      tanggal_awal: formData.tanggal_awal ? momentPackage(formData.tanggal_awal).format("YYYY-MM-DD") : "",
      tanggal_akhir: formData.tanggal_akhir ? momentPackage(formData.tanggal_akhir).format("YYYY-MM-DD") : "",
      deskripsi: formData.deskripsi,
      warna: formData.mLabelKalenderId,
    };


    let res;
    if (editData && editData.id) {
      // Edit: gunakan putKalenderPribadi dari KalenderClient.js
      res = await putKalenderPribadi(editData.id, payload);
    } else {
      // Tambah: gunakan postKalenderPribadi dari KalenderClient.js
      res = await postKalenderPribadi(payload);
    }
    const { data, error } = res;
    if (data) {
      toast.success(editData ? "Berhasil mengubah kalender pribadi" : "Berhasil menambah kalender pribadi");
      setButtonState("success");
      hideModal("ModalBuatKalenderPribadi");
      _getKalenderData && _getKalenderData();
      setFormData(initialFormData);
      setEditData && setEditData(null);
    } else {
      toast.error(error?.message || (editData ? "Gagal mengubah kalender pribadi" : "Gagal menambah kalender pribadi"));
      setButtonState("error");
    }
  };

  return (
    <NewModal
      modalId="ModalBuatKalenderPribadi"
      modalSize="lg"
      title={
        <>
          <h4 className="mb-1 fw-extrabold">
            {editData ? "Edit" : "Buat"} Kalender Pribadi
          </h4>
          <span className="fs-6 fw-normal">
            Isi informasi dibawah untuk membuat kalender pribadi
          </span>
        </>
      }
      content={
        <>
          <div className="mb-4">
            <label className="form-label">Nama Kegiatan Pribadi</label>
            <input
              className="form-control"
              autoComplete="off"
              placeholder="Tuliskan nama kegiatan pribadi"
              type="text"
              name="nama"
              value={formData.nama}
              onChange={handleChangeInput}
            />
          </div>
          <div className="mb-4">
            <label className="form-label">Label Kalender</label>
            <SelectShared
              name="label"
              handleChangeSelect={handleChangeLabel}
              value={formData.mLabelKalenderId}
              options={optionLabel}
              placeholder="Pilih label kalender"
            />
          </div>
          <div className="row">
            <div className="col-md-6 mb-4">
              <label className="form-label">Tanggal Mulai</label>
              <DatePicker
                format="YYYY-MM-DD"
                style={{ width: "100%" }}
                value={formData.tanggal_awal}
                onChange={(date) => {
                  const newForm = { ...formData, tanggal_awal: date };
                  setFormData(newForm);
                  // Validasi tanggal
                  if (
                    date &&
                    formData.tanggal_akhir &&
                    momentPackage(date).isAfter(momentPackage(formData.tanggal_akhir))
                  ) {
                    setDateError("Tanggal mulai harus sebelum atau sama dengan tanggal selesai.");
                  } else {
                    setDateError("");
                  }
                }}
                placeholder="dd / mm / yyyy"
                allowClear={false}
              />
            </div>
            <div className="col-md-6 mb-4">
              <label className="form-label">Tanggal Selesai</label>
              <DatePicker
                format="YYYY-MM-DD"
                style={{ width: "100%" }}
                value={formData.tanggal_akhir}
                onChange={(date) => {
                  const newForm = { ...formData, tanggal_akhir: date };
                  setFormData(newForm);
                  // Validasi tanggal
                  if (
                    date &&
                    formData.tanggal_awal &&
                    momentPackage(formData.tanggal_awal).isAfter(momentPackage(date))
                  ) {
                    setDateError("Tanggal mulai harus sebelum atau sama dengan tanggal selesai.");
                  } else {
                    setDateError("");
                  }
                }}
                placeholder="dd / mm / yyyy"
                allowClear={false}
              />
            </div>
            {dateError && (
              <div className="col-12">
                <span style={{ color: "red", fontSize: "0.9rem" }}>{dateError}</span>
              </div>
            )}
          </div>

          <div className="mb-4">
            <label className="form-label">Deskripsi</label>
            <textarea
              className="form-control"
              name="deskripsi"
              rows={3}
              value={formData.deskripsi}
              onChange={handleChangeInput}
              placeholder="Tuliskan deskripsi kegiatan pribadi"
              autoComplete="off"
            />
          </div>
        </>
      }
      submitButton={
        <ReactiveButton
          buttonState={buttonState}
          onClick={submitModal}
          color={"primary"}
          idleText={editData ? "Edit" : "Buat"}
          loadingText="Diproses"
          successText="Berhasil"
          errorText="Gagal"
          type="button"
          data-bs-dismiss="modal"
          className="btn btn-primary"
        />
      }
    />
  );
};

export default ModalBuatKalenderPribadi;