import { DatePicker } from "antd";
import ModalBuatLabelKalender from "./ModalBuatLabelKalender";
import ReactiveButton from "reactive-button";
import NewModal from "../Shared/NewModal/NewModal";
import SelectShared from "../Shared/SelectShared/SelectShared";
import { momentPackage } from "../../utilities/HelperUtils";
import { useEffect, useState } from "react";
import {
  getKalenderData,
  postKalenderPendidikan,
  putKalenderPendidikan,
} from "../../client/KalenderClient";
import { toast } from "react-toastify";
import { hideModal } from "../../utilities/ModalUtils";

const initialFormData = {
  nama: "",
  mLabelKalenderId: "",
  tanggalAwal: momentPackage(),
  tanggalAkhir: momentPackage(),
};

const ModalBuatKalenderPendidikan = ({ _getKalenderData, editData }) => {
  const [formData, setFormData] = useState(initialFormData);
  const [buttonState, setButtonState] = useState("idle");
  const [dateError, setDateError] = useState("");

  const [listLabel, setListLabel] = useState([]);

  const optionLabel =
    (listLabel?.length > 0 &&
      listLabel?.map((label) => ({
        label: label?.nama,
        value: label?.id,
      }))) ||
    [];

  const _getKalenderLabel = async () => {
    const { data } = await getKalenderData();
    if (data) {
      setListLabel(data?.label);
    }
  };

  // Fungsi untuk buka modal buat label dan refresh label setelah selesai
  const handleLabelCreated = async () => {
    await _getKalenderLabel();
  };

  const handleChangeDate = (date, key) => {
    const newFormData = {
      ...formData,
      [key]: date ? momentPackage(date) : "",
    };
    setFormData(newFormData);
    // Validasi tanggal
    if (
      key === "tanggalAwal" &&
      newFormData.tanggalAkhir &&
      date &&
      momentPackage(date).isAfter(momentPackage(newFormData.tanggalAkhir))
    ) {
      setDateError("Tanggal mulai harus sebelum tanggal selesai.");
    } else if (
      key === "tanggalAkhir" &&
      newFormData.tanggalAwal &&
      date &&
      momentPackage(newFormData.tanggalAwal).isAfter(momentPackage(date))
    ) {
      setDateError("Tanggal mulai harus sebelum tanggal selesai.");
    } else {
      setDateError("");
    }
  };

  const submitModal = async () => {
    // Validasi sebelum submit
    if (
      momentPackage(formData.tanggalAwal).isAfter(momentPackage(formData.tanggalAkhir))
    ) {
      setDateError("Tanggal mulai harus sebelum tanggal selesai.");
      setButtonState("idle");
      return;
    }
    setButtonState("loading");
    let body = {
      ...formData,
      tanggalAwal: momentPackage(formData.tanggalAwal).format("YYYY-MM-DD"),
      tanggalAkhir: momentPackage(formData.tanggalAkhir).format("YYYY-MM-DD"),
    };
    const { data } =
      editData != null
        ? await putKalenderPendidikan(editData?.id, { ...body })
        : await postKalenderPendidikan(body);
    if (data) {
      toast.success(data?.message);
      hideModal("ModalBuatKalenderPendidikan");
      setFormData(initialFormData);
      window.location.reload();
      setButtonState("success");
      _getKalenderData();
    }

    setButtonState("idle");
  };

  useEffect(() => {
    _getKalenderLabel();
  }, []);

  useEffect(() => {
    if (editData !== null || editData != undefined) {
      setFormData({
        nama: editData?.nama,
        mLabelKalenderId: editData?.mLabelKalenderId,
        tanggalAwal: momentPackage(editData?.tanggalAwal),
        tanggalAkhir: momentPackage(editData?.tanggalAkhir),
      });
    } else {
      setFormData(initialFormData);
    }
  }, [editData]);

  return (
    <NewModal
      modalId="ModalBuatKalenderPendidikan"
      modalSize="lg"
      onShow={_getKalenderLabel}
      title={
        <>
          <h4 className="mb-1 fw-extrabold">
            {editData ? "Edit" : "Buat"} Kalender Pendidikan
          </h4>
          <span className="fs-6 fw-normal">
            Isi informasi dibawah untuk membuat kalender pendidikan
          </span>
        </>
      }
      content={
        <>
          <div className="mb-4">
            <label className="form-label">Nama Kegiatan Pendidikan</label>
            <input
              className="form-control"
              autoComplete="off"
              placeholder="Tuliskan nama kegiatan pendidikan"
              type="text"
              name="nama"
              value={formData.nama}
              onChange={(e) =>
                setFormData({ ...formData, nama: e.target.value })
              }
            />
          </div>
          <div className="mb-4">
            <label className="form-label">Label Kalender</label>
            <SelectShared
              name="label"
              handleChangeSelect={(e) =>
                setFormData({ ...formData, mLabelKalenderId: e.value })
              }
              value={formData.mLabelKalenderId}
              options={optionLabel}
              placeholder="Pilih label kalender"
            />
          </div>
          <div className="row">
            <div className="col-md-6 mb-4">
              <label className="form-label">Tanggal Mulai</label>
              <DatePicker
                onChange={(date, dateString) =>
                  handleChangeDate(dateString, "tanggalAwal")
                }
                placeholder="dd / mm / yyyy"
                className="form-control"
                autoComplete="off"
                value={momentPackage(formData.tanggalAwal)}
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
        </>
      }
      submitButton={
        <ReactiveButton
          buttonState={buttonState}
          onClick={submitModal}
          color={"primary"}
          idleText={`${editData != null ? "Edit" : "Buat"}`}
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

export default ModalBuatKalenderPendidikan;
