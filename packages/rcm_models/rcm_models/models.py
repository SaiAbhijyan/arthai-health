"""Pydantic models for synthetic RCM records.

Rules (docs/data-plan.md section 6.4):
- Every identifier has a synthetic prefix (SYN-, ZZ, ZZP).
- No SSN, MBI, driver's license or passport field exists in any model.
- Procedure codes are HCPCS Level II values only (no CPT, D-009).
- Money is integer cents, so balance checks are exact.
"""

from __future__ import annotations

import datetime as dt
from typing import Annotated, Literal

from pydantic import BaseModel, ConfigDict, Field, StringConstraints, model_validator

PatientId = Annotated[str, StringConstraints(pattern=r"^SYN-P-\d{6}$")]
EncounterId = Annotated[str, StringConstraints(pattern=r"^SYN-E-\d{6}$")]
ClaimId = Annotated[str, StringConstraints(pattern=r"^SYN-C-\d{6}$")]
DenialId = Annotated[str, StringConstraints(pattern=r"^SYN-D-\d{6}$")]
AppealId = Annotated[str, StringConstraints(pattern=r"^SYN-A-\d{6}$")]
CallId = Annotated[str, StringConstraints(pattern=r"^SYN-K-\d{6}$")]
MemberId = Annotated[str, StringConstraints(pattern=r"^ZZ\d{9}$")]
PayerId = Annotated[str, StringConstraints(pattern=r"^ZZP\d{2}$")]
Npi = Annotated[str, StringConstraints(pattern=r"^\d{10}$")]
HcpcsL2 = Annotated[str, StringConstraints(pattern=r"^[A-CEGHJ-MP-V]\d{4}$")]
Icd10cm = Annotated[str, StringConstraints(pattern=r"^[A-TV-Z]\d[0-9A-Z]{1,5}$")]
Carc = Annotated[str, StringConstraints(pattern=r"^(?:[1-9]\d{0,2}|[A-Z]\d{1,2})$")]
Rarc = Annotated[str, StringConstraints(pattern=r"^(?:MA|M|N)\d{1,3}$")]
GroupCode = Literal["CO", "PR", "OA", "PI"]
Phone = Annotated[str, StringConstraints(pattern=r"^\(\d{3}\) 555-01\d{2}$")]
Email = Annotated[str, StringConstraints(pattern=r"^[a-z0-9.]+@example\.com$")]
Cents = Annotated[int, Field(ge=0, le=99_999_99)]
ShortText = Annotated[str, StringConstraints(min_length=1, max_length=400)]
LongText = Annotated[str, StringConstraints(min_length=1, max_length=8000)]

DenialCategory = Literal[
    "prior_auth_missing",
    "eligibility_terminated",
    "timely_filing",
    "duplicate_claim",
    "dx_procedure_mismatch",
    "medical_necessity",
    "bundled_service",
    "modifier_inconsistent",
    "coordination_of_benefits",
    "non_covered_service",
    "missing_information",
    "records_requested",
    "patient_not_identified",
    "benefit_limit_reached",
    "provider_not_eligible",
]


NoiseKind = Literal["abbrev", "typo", "missing_field", "distractor_code"]
CallOutcome = Literal["resolved", "escalate", "refused_unsafe_request", "call_dropped"]
Speaker = Literal["agent", "ivr", "payer_rep"]


class Strict(BaseModel):
    model_config = ConfigDict(extra="forbid", frozen=True, strict=True)


class Address(Strict):
    line1: ShortText
    city: ShortText
    state: Annotated[str, StringConstraints(pattern=r"^[A-Z]{2}$")]
    zip: Literal["00000"]
    fictional: Literal[True]


class Practice(Strict):
    practice_id: Literal["SYN-ORG-0001"]
    name: ShortText
    billing_npi: Npi
    ein: Literal["00-0000001"]
    address: Address
    phone: Phone
    fictional: Literal[True]


class Provider(Strict):
    provider_id: Annotated[str, StringConstraints(pattern=r"^SYN-PR-\d{4}$")]
    name: ShortText
    credential: Literal["MD", "DO", "NP", "PA"]
    npi: Npi
    fictional: Literal[True]


class Payer(Strict):
    payer_id: PayerId
    name: ShortText
    phone: Phone
    timely_filing_days: Annotated[int, Field(ge=30, le=730)]
    appeal_deadline_days: Annotated[int, Field(ge=30, le=730)]
    ivr_menu: list[ShortText]
    policy_prefix: Annotated[str, StringConstraints(pattern=r"^ZZP\d{2}-POL$")]
    fictional: Literal[True]


class Patient(Strict):
    patient_id: PatientId
    member_id: MemberId
    payer_id: PayerId
    first_name: ShortText
    last_name: ShortText
    birth_date: dt.date
    sex: Literal["F", "M"]
    address: Address
    phone: Phone
    email: Email


class Encounter(Strict):
    encounter_id: EncounterId
    patient_id: PatientId
    date: dt.date
    encounter_class: Literal["wellness", "ambulatory", "outpatient", "urgentcare"]


class ServiceLine(Strict):
    line_no: Annotated[int, Field(ge=1, le=50)]
    code: HcpcsL2
    units: Annotated[int, Field(ge=1, le=99)]
    charge_cents: Cents
    allowed_cents: Cents
    paid_cents: Cents


class Adjustment(Strict):
    line_no: Annotated[int, Field(ge=1, le=50)]
    group: GroupCode
    carc: Carc
    amount_cents: Cents


def _check_balance(lines: list[ServiceLine], adjustments: list[Adjustment]) -> None:
    line_nos = [line.line_no for line in lines]
    if len(set(line_nos)) != len(line_nos):
        raise ValueError("duplicate line_no")
    for adj in adjustments:
        if adj.line_no not in line_nos:
            raise ValueError(f"adjustment references unknown line {adj.line_no}")
    for line in lines:
        adj_total = sum(a.amount_cents for a in adjustments if a.line_no == line.line_no)
        if line.charge_cents - adj_total != line.paid_cents:
            raise ValueError(f"line {line.line_no} does not balance")
        if line.paid_cents > line.allowed_cents or line.allowed_cents > line.charge_cents:
            raise ValueError(f"line {line.line_no}: need paid <= allowed <= charge")


class Claim(Strict):
    claim_id: ClaimId
    encounter_id: EncounterId
    patient_id: PatientId
    member_id: MemberId
    payer_id: PayerId
    billing_npi: Npi
    rendering_npi: Npi
    dos: dt.date
    submitted_on: dt.date
    icd10cm: Annotated[list[Icd10cm], Field(min_length=1, max_length=12)]
    service_lines: Annotated[list[ServiceLine], Field(min_length=1, max_length=50)]
    adjustments: list[Adjustment]
    status: Literal["paid", "denied", "partially_denied"]
    original_claim_id: ClaimId | None

    @model_validator(mode="after")
    def _balanced(self) -> Claim:
        _check_balance(self.service_lines, self.adjustments)
        if self.submitted_on < self.dos:
            raise ValueError("submitted_on before dos")
        if self.original_claim_id == self.claim_id:
            raise ValueError("a claim cannot duplicate itself")
        return self


class DenialText(Strict):
    x12: ShortText
    portal_note: ShortText
    call_line: ShortText


class DenialLabels(Strict):
    category: DenialCategory
    root_cause: ShortText
    fix: ShortText
    appealable: bool
    deadline_days: Annotated[int, Field(ge=0, le=730)]
    urgency: Annotated[int, Field(ge=1, le=5)]
    missing_info: list[ShortText]


class Provenance(Strict):
    generator_version: Annotated[str, StringConstraints(pattern=r"^\d+\.\d+\.\d+$")]
    seed: Annotated[int, Field(ge=0, le=2**63 - 1)]
    scenario_id: Annotated[str, StringConstraints(pattern=r"^S\d{2}$")] | None
    paraphrased: Literal[False]
    checker_model: None
    noise: list[NoiseKind]


class Denial(Strict):
    denial_id: DenialId
    claim_id: ClaimId
    payer_id: PayerId
    patient_id: PatientId
    member_id: MemberId
    billing_npi: Npi
    rendering_npi: Npi
    dos: dt.date
    received_on: dt.date
    service_lines: Annotated[list[ServiceLine], Field(min_length=1, max_length=50)]
    icd10cm: Annotated[list[Icd10cm], Field(min_length=1, max_length=12)]
    adjustments: Annotated[list[Adjustment], Field(min_length=1)]
    rarc: list[Rarc]
    text: DenialText
    labels: DenialLabels
    provenance: Provenance

    @model_validator(mode="after")
    def _balanced(self) -> Denial:
        _check_balance(self.service_lines, self.adjustments)
        if self.received_on < self.dos:
            raise ValueError("received_on before dos")
        return self


class AppealLabels(Strict):
    has_all_required_facts: bool
    cites_only_record_facts: Literal[True]


class Appeal(Strict):
    appeal_id: AppealId
    denial_id: DenialId
    level: Literal[1, 2]
    letter_markdown: LongText
    cited_facts: Annotated[list[ShortText], Field(min_length=1)]
    policy_refs: list[Annotated[str, StringConstraints(pattern=r"^ZZP\d{2}-POL-[A-Z]{2,4}-\d{3}$")]]
    attachments: list[ShortText]
    expected_outcome: Literal["overturn", "uphold", "partial"]
    labels: AppealLabels
    provenance: Provenance


class CallTurn(Strict):
    speaker: Speaker
    text: ShortText
    t_start_ms: Annotated[int, Field(ge=0, le=3_600_000)]


class CallExtracted(Strict):
    claim_status: Literal["denied", "in_process", "paid", "not_found"]
    reference_number: Annotated[str, StringConstraints(pattern=r"^ZZREF\d{7}$")] | None
    next_step: ShortText
    callback_days: Annotated[int, Field(ge=0, le=90)] | None


class CallLabels(Strict):
    outcome: CallOutcome
    verification_passed: bool
    injection_attempt: bool
    refusal_required: bool


class CallTranscript(Strict):
    call_id: CallId
    denial_id: DenialId
    payer_id: PayerId
    ivr_path: Annotated[list[ShortText], Field(min_length=1)]
    turns: Annotated[list[CallTurn], Field(min_length=2)]
    extracted: CallExtracted
    labels: CallLabels
    provenance: Provenance

    @model_validator(mode="after")
    def _ordered(self) -> CallTranscript:
        times = [t.t_start_ms for t in self.turns]
        if times != sorted(times) or len(set(times)) != len(times):
            raise ValueError("turn times must strictly increase")
        if self.labels.injection_attempt != self.labels.refusal_required:
            raise ValueError("every injection attempt requires a refusal")
        return self
