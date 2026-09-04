import { useEffect, useState } from "react";
import { supabase } from "../supabase";

export default function Campaigns() {

if (
  localStorage.getItem(
    "loggedin"
  ) !== "true"
) {

  window.location = "/";
  return null;

}

  const [campaigns, setCampaigns] = useState([]);

  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    domain: "",
    ad_url: "",
    priority: 100,
    status: true,
    start_date: "",
    end_date: ""
  });

  const loadCampaigns = async () => {

    const { data, error } = await supabase
      .from("campaigns")
      .select("*")
      .order("priority", { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    setCampaigns(data || []);
  };

  useEffect(() => {
    loadCampaigns();
  }, []);

  const clearForm = () => {

    setEditingId(null);

    setForm({
      name: "",
      domain: "",
      ad_url: "",
      priority: 100,
      status: true,
      start_date: "",
      end_date: ""
    });
  };

  const saveCampaign = async () => {

if (!editingId) {

  const domain =
    form.domain.trim().toLowerCase();

  const adUrl =
    form.ad_url.trim().toLowerCase();

  const duplicate =
    campaigns.find(
      x =>
        x.audience_rules?.domain
          ?.trim()
          .toLowerCase() === domain
        &&
        x.ad_url
          ?.trim()
          .toLowerCase() === adUrl
    );

  if (duplicate) {

    alert(
      "Same Domain + Ad URL already exists"
    );

    return;
  }
}

    const payload = {
      name: form.name,
      ad_url: form.ad_url,
      priority: Number(form.priority),
      status: form.status,
      start_date: form.start_date,
      end_date: form.end_date,
      audience_rules: {
        domain: form.domain
      }
    };

    let result;

    if (editingId) {

      result = await supabase
        .from("campaigns")
        .update(payload)
        .eq("id", editingId);

    } else {

      result = await supabase
        .from("campaigns")
        .insert([payload]);
    }

    if (result.error) {
      alert(result.error.message);
      return;
    }

    clearForm();
    loadCampaigns();
  };

  const editCampaign = (c) => {

    setEditingId(c.id);

    setForm({
      name: c.name || "",
      domain: c.audience_rules?.domain || "",
      ad_url: c.ad_url || "",
      priority: c.priority || 100,
      status: c.status,
      start_date: c.start_date
        ? c.start_date.substring(0,16)
        : "",
      end_date: c.end_date
        ? c.end_date.substring(0,16)
        : ""
    });
  };

const deleteCampaign =
async(id)=>{

if(
!window.confirm(
"Delete this campaign?"
)
){
return
}

await supabase
.from("campaigns")
.delete()
.eq("id",id)

loadCampaigns()

}

const toggleStatus = async (c) => {

  if (
    c.status &&
    !window.confirm(
      "Disable this campaign?"
    )
  ) {
    return;
  }

  await supabase
    .from("campaigns")
    .update({
      status: !c.status
    })
    .eq("id", c.id);

  loadCampaigns();
};

  return (
    <div style={{ padding: "20px" }}>

<h2>
Campaign Management
</h2>

<h3>
Total Campaigns:
{campaigns.length}
</h3>

<h3>
Current Highest Priority Campaign:
{
campaigns.length > 0
? campaigns[0].name
: "None"
}
</h3>

<button
  onClick={() => {
    localStorage.removeItem("loggedin");
    window.location="/";
  }}
  style={{
    background:"red",
    color:"white",
    border:"none",
    padding:"8px 15px",
    cursor:"pointer"
  }}
>
  Logout
</button>

      <div
        style={{
          border: "1px solid #ccc",
          padding: "15px",
          marginBottom: "20px"
        }}
      >

        <h3>
          {editingId
            ? "Edit Campaign"
            : "Create Campaign"}
        </h3>

        <input
          placeholder="Campaign Name"
          value={form.name}
          onChange={(e)=>
            setForm({
              ...form,
              name:e.target.value
            })
          }
        />

        <br/><br/>

        <input
          placeholder="Domain"
          value={form.domain}
          onChange={(e)=>
            setForm({
              ...form,
              domain:e.target.value
            })
          }
        />

        <br/><br/>

        <input
          placeholder="Ad URL"
          value={form.ad_url}
          onChange={(e)=>
            setForm({
              ...form,
              ad_url:e.target.value
            })
          }
        />

        <br/><br/>

        <input
          type="number"
          placeholder="Priority"
          value={form.priority}
          onChange={(e)=>
            setForm({
              ...form,
              priority:e.target.value
            })
          }
        />

        <br/><br/>

        <label>Status </label>

        <input
          type="checkbox"
          checked={form.status}
          onChange={(e)=>
            setForm({
              ...form,
              status:e.target.checked
            })
          }
        />

        <br/><br/>

        <label>Start Date</label>

        <br/>

        <input
          type="datetime-local"
          value={form.start_date}
          onChange={(e)=>
            setForm({
              ...form,
              start_date:e.target.value
            })
          }
        />

        <br/><br/>

        <label>End Date</label>

        <br/>

        <input
          type="datetime-local"
          value={form.end_date}
          onChange={(e)=>
            setForm({
              ...form,
              end_date:e.target.value
            })
          }
        />

        <br/><br/>

        <button onClick={saveCampaign}>
          {editingId
            ? "Update Campaign"
            : "Create Campaign"}
        </button>

        <button
          onClick={clearForm}
          style={{marginLeft:"10px"}}
        >
          Clear
        </button>

      </div>

      <table
        border="1"
        cellPadding="8"
      >

<thead>
<tr>
<th>ID</th>
<th>Name</th>
<th>Domain</th>
<th>Ad URL</th>
<th>Priority</th>
<th>Status</th>
<th>Impressions</th>
<th>Start</th>
<th>End</th>
<th>Actions</th>
</tr>
</thead>

        <tbody>

          {campaigns.map((c) => (

            <tr key={c.id}>

              <td>{c.id}</td>

              <td>{c.name}</td>

              <td>
                {c.audience_rules?.domain}
              </td>

<td>{c.ad_url}</td>

<td>{c.priority}</td>

<td>
<span
style={{
color:
c.status
? "green"
: "red",
fontWeight:"bold"
}}
>
{
c.status
? "ACTIVE"
: "DISABLED"
}
</span>
</td>

<td>
{
c.impressions || 0
}
</td>

<td>
{
new Date(
c.start_date
).toLocaleString()
}
</td>

<td>
{
new Date(
c.end_date
).toLocaleString()
}
</td>

              <td>

                <button
                  onClick={() =>
                    editCampaign(c)
                  }
                >
                  Edit
                </button>

                {" "}

                <button
                  onClick={() =>
                    toggleStatus(c)
                  }
                >
                  {c.status
                    ? "Disable"
                    : "Enable"}
                </button>

                {" "}

                <button
                  onClick={() =>
                    deleteCampaign(c.id)
                  }
                >
                  Delete
                </button>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>
  );
}
