import React, { useEffect, useState, useCallback } from "react";

// ** Web3
import Web3 from "web3";
import { useWeb3React } from "@web3-react/core";

// ** Import Material Components
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import Card from "@mui/material/Card";
import Tabs from "@mui/material/Tabs";
import Table from "@mui/material/Table";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import Skeleton from '@mui/material/Skeleton';
import TableRow from "@mui/material/TableRow";
import Collapse from '@mui/material/Collapse';
import Container from "@mui/material/Container";
import TextField from "@mui/material/TextField";
import TableHead from "@mui/material/TableHead";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import ButtonGroup from "@mui/material/ButtonGroup";
import useMediaQuery from "@mui/material/useMediaQuery";
import InputAdornment from "@mui/material/InputAdornment";
import CircularProgress from "@mui/material/CircularProgress";

// ** Import Icons
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

import ConnectWallet from "../components/ConnectWallet";


import useStyles from "../assets/styles";

import { useParams } from "react-router-dom";
import { useHistory } from "react-router";
import { useApi } from "../hooks";

import config from "../config/app";
import { Stack } from "@mui/material";

const Pool = () => {
    const api = useApi();
    const params = useParams();
    const history = useHistory();
    const classes = useStyles.pool();
    const isMobile = useMediaQuery("(max-width:600px)");

    const [at, setAT] = useState(0);
    const [am, setAM] = useState(0);
    const [ap, setAP] = useState();
    const [db, setDB] = useState();
    const [rw, setRW] = useState({});
    const [wb, setWB] = useState();
    const [ub, setUB] = useState();
    const [tr, setTR] = useState();
    const [vb, setVB] = useState();
    const [vi, setVI] = useState([]);
    const [il, setIL] = useState();
    const [mc, setMC] = useState(0);
    const [owl, setOWL] = useState(false);
    const [ivo, setIVO] = useState(false);
    const [wbwp, setWBWP] = useState();
    const [wbwop, setWBWOP] = useState();
    const [apd, setAPD] = useState();

    const { account, library, chainId } = useWeb3React();
    const cv = config.contracts.find(item => item.id === params.id);

    const hat = (e, nt) => {
        setAT(nt);
        setAM(0);
    };

    const smb = async (bmax, wmax) => {
        switch (at) {
            case 0: {
                setAM(bmax.toString());
                break;
            }
            case 1: {
                setAM(wmax.toString());
            }
        }
    };

    const fn = (val, decimal = 4) => {
        if (!isNaN(Number(val))) {
            const trimVal = Number(Number(val).toFixed(decimal));
            return trimVal;
        } else {
            return Number(0);
        }
    }

    const toWei = useCallback((web3, val) => {
        if (val) {
            val = val.toString();
            return web3.utils.toWei(val);
        } else {
            return "0"
        }
    }, []);

    const fromWei = useCallback((web3, val) => {
        if (val) {
            val = val.toString();
            return web3.utils.fromWei(val);
        } else {
            return "0"
        }
    }, []);

    const toBN = useCallback((web3, val) => {
        if (val) {
            val = val.toString();
            return new web3.utils.BN(val);
        } else {
            return "0"
        }
    }, []);

    const vest = async () => {
        try {
            setIL(true);
            const web3 = new Web3(library.provider);
            const vaultC = new web3.eth.Contract(
                cv.vault.abi,
                cv.vault.address
            );
            await vaultC.methods.vest().send({ from: account });
            await updateData();
        } catch {
            await updateData();
        }
    }

    const claim = async () => {
        try {
            setIL(true);
            const web3 = new Web3(library.provider);
            const vaultC = new web3.eth.Contract(
                cv.vault.abi,
                cv.vault.address
            );

            await vaultC.methods.claim().send({ from: account });
            await updateData();
        } catch {
            await updateData();
        }
    }

    const claim_aumi = async () => {
        try {
            setIL(true);
            const web3 = new Web3(library.provider);
            const rewarderC = new web3.eth.Contract(
                cv.rewarder.abi,
                cv.rewarder.address
            );

            await rewarderC.methods.claim().send({ from: account });
            await updateData();
        } catch {
            await updateData();
        }
    }

    const updateTokenPrices = useCallback(async () => {
        try {
            let ids = null;
            let prices = {};

            const tokenList = config.tokens;

            for (let i = 0; i < tokenList.length; i++) {
                const id = tokenList[i];
                ids = ids ? ids += `,${id}` : ids = id;
            }
            const price = await api.getCurrentPrice(ids, "usd");
            for (let i in price) {
                prices[i] = price[i].usd;
            }
            const price2string = JSON.stringify(prices);
            localStorage.setItem("cached-token-prices-automatic", price2string);
            return prices;
        } catch (e) {
            const cache = localStorage.getItem("cached-token-prices-automatic");
            if (cache) {
                const string2prices = JSON.parse(cache);
                return string2prices;
            } else {
                return {}
            }
        }
    }, [api]);

    const deposit = async () => {
        if (Number(am) > Number(wb)) {
            alert("Your balance is not enough to deposit.", "info");
            return;
        } else if (!am) {
            alert("Please input valid amount.", "info");
            return;
        } else {
            try {
                setIL(true);
                const web3 = new Web3(library.provider);
                const aaw = toWei(web3, am);

                const vaultC = new web3.eth.Contract(
                    cv.vault.abi,
                    cv.vault.address
                );

                switch (cv.tags[0]) {
                    case "AUMI": {
                        const aumiC = new web3.eth.Contract(
                            cv.aumi.abi,
                            cv.aumi.address
                        );
                        const allowance = await aumiC.methods.allowance(account, vaultC._address).call({ from: account });
                        if (toBN(web3, allowance).lt(toBN(web3, aaw))) {
                            await aumiC.methods.approve(vaultC._address, toWei(web3, "100000")).send({ from: account });
                        }
                        let result = null;

                        result = await vaultC.methods.vest(account, aaw).send({ from: account });

                        alert(`From :${result.from} To: ${result.to} Status: True`, "success");
                        await updateData();
                        break;
                    }
                    case "QUICK": {
                        const quickC = new web3.eth.Contract(
                            cv.quick.abi,
                            cv.quick.address
                        );
                        const allowance = await quickC.methods.allowance(account, vaultC._address).call({ from: account });
                        if (toBN(web3, allowance).lt(toBN(web3, aaw))) {
                            await quickC.methods.approve(vaultC._address, toWei(web3, "100000")).send({ from: account });
                        }
                        const result = await vaultC.methods.deposit(aaw).send({ from: account });
                        alert(`From :${result.from} To: ${result.to} Status: True`, "success");
                        await updateData();
                        break;
                    }
                    case "LP": {
                        const lpC = new web3.eth.Contract(
                            cv.lp.abi,
                            cv.lp.address
                        );
                        const allowance = await lpC.methods.allowance(account, vaultC._address).call({ from: account });
                        if (toBN(web3, allowance).lt(toBN(web3, aaw))) {
                            await lpC.methods.approve(vaultC._address, toWei(web3, "100000")).send({ from: account });
                        }
                        const result = await vaultC.methods.deposit(aaw).send({ from: account });
                        alert(`From :${result.from} To: ${result.to} Status: True`, "success");
                        await updateData();
                        break;
                    }
                }
            } catch {
                await updateData();
            }
        }
    }

    const withdraw = async () => {
        if (Number(am) > Number(db)) {
            alert("Your balance is not enough to withdraw.", "info");
            return;
        } else if (!am) {
            alert("Please input valid am.", "info");
            return;
        } else {
            try {
                setIL(true);
                const web3 = new Web3(library.provider);
                const aaw = toWei(web3, am);
                const vaultC = new web3.eth.Contract(
                    cv.vault.abi,
                    cv.vault.address
                );
                const result = await vaultC.methods.withdraw(aaw).send({ from: account });
                alert(`From :${result.from} To: ${result.to} Status: True`, "success");
                await updateData();
            } catch {
                await updateData();
            }
        }
    };

    const withdrawAll = async () => {
        try {
            setIL(true);
            const web3 = new Web3(library.provider);
            const vaultC = new web3.eth.Contract(
                cv.vault.abi,
                cv.vault.address
            );
            const result = await vaultC.methods.withdrawAll().send({ from: account });
            if (cv.tags[1] === "STAKE") {
                const { unlockable } = await vaultC.methods.lockedBalances(account).call();
                if (unlockable > 0) {
                    await vaultC.methods.withdrawExpiredLocks().send({ from: account });
                }
            }
            alert(`From :${result.from} To: ${result.to} Status: True`, "success");
            await updateData();
        } catch {
            await updateData();
        }
    }

    const calcRewardTokenPrice = (token, tokenPrices, lpPrice) => {
        let result = [];
        for (let i = 0; i < token.length; i++) {
            switch (token[i]) {
                case "LP": {
                    result[i] = lpPrice;
                    break;
                }
                case "QUICK": {
                    result[i] = tokenPrices["quick"]
                    break;
                }
                case "AUMI": {
                    result[i] = tokenPrices["automatic-network"]
                    break;
                }
                case "WMATIC": {
                    result[i] = tokenPrices["matic-network"]
                    break;
                }
                case "WBTC": {
                    result[i] = tokenPrices["wrapped-bitcoin"]
                    break;
                }
                case "MATIC": {
                    result[i] = tokenPrices["matic-network"]
                    break;
                }
                default: {
                    result[i] = 0
                }
            }
        }
        return result;
    }

    const updateData = useCallback(async () => {
        try {
            setIL(true);
            const web3 = new Web3(library.provider);
            const tokenPrices = await updateTokenPrices();

            const { origin } = config.base;

            const vaultC = new web3.eth.Contract(
                cv.vault.abi,
                cv.vault.address
            );

            const getAUMIapr = async () => {
                const av = config.contracts.find(item => item.id === 'aumi-stake');
                const aumiStakeVault = new web3.eth.Contract(
                    av.vault.abi,
                    av.vault.address
                );
                const secsForYear = toBN(web3, 60 * 60 * 24 * 365);
                const rewardData = await aumiStakeVault.methods.rewardData("0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270").call()
                const rewardRate = toBN(web3, rewardData.rewardRate);
                const btSupply = toBN(web3, await aumiStakeVault.methods.totalSupply().call());
                const map = tokenPrices["matic-network"] / tokenPrices["automatic-network"];
                const bmap = toBN(web3, toWei(web3, map));

                const APR = rewardRate.mul(secsForYear).mul(bmap).div(btSupply);

                return Number(fromWei(web3, APR));
            }

            const multipler = tokenPrices["automatic-network"] * cv.mint.rate / tokenPrices["matic-network"];

            switch (cv.tags[0]) {
                case "AUMI": {
                    const aumiC = new web3.eth.Contract(
                        cv.aumi.abi,
                        cv.aumi.address
                    );
                    const rewarderC = new web3.eth.Contract(
                        cv.rewarder.abi,
                        cv.rewarder.address
                    );
                    const walletB = await aumiC.methods.balanceOf(account).call();
                    const rewards = await vaultC.methods.claimable(account).call();
                    const aumiProfit = await rewarderC.methods.claimable(account).call();
                    const userB = await vaultC.methods.balanceOf(account).call();

                    const DB = fromWei(web3, userB);
                    const UB = DB * tokenPrices[cv.base_token.id];
                    const lb = await vaultC.methods.lockedBalances(account).call();
                    const wb = await vaultC.methods.withdrawableBalance(account).call();
                    const wo = await vaultC.methods.unlockedBalance(account).call();

                    const LU = Number(fromWei(web3, lb.unlockable));
                    setWBWP(fromWei(web3, wb.amount)) + LU;
                    setWBWOP(fromWei(web3, wo)) + LU;

                    const rPrices = await calcRewardTokenPrice(cv.rewards, tokenPrices);

                    const vestD = await vaultC.methods.vestedBalances(account).call();
                    setVI(vestD.earningsData);
                    setVB(fromWei(web3, vestD.total));
                    setRW({
                        [cv.rewards[0]]: {
                            crypto: fromWei(web3, rewards.totalReward),
                            usd: fromWei(web3, rewards.totalReward) * Number(rPrices[0] ? rPrices[0] : 0)
                        },
                        [cv.rewards[1]]: {
                            crypto: fromWei(web3, aumiProfit._autoRewards),
                            usd: fromWei(web3, aumiProfit._autoRewards) * Number(rPrices[1] ? rPrices[1] : 0)
                        }
                    });
                    const TR =
                        fromWei(web3, rewards.totalReward) * Number(rPrices[0] ? rPrices[0] : 0) +
                        fromWei(web3, rewards.lockedReward) * Number(rPrices[1] ? rPrices[1] : 0);
                    setTR(TR);

                    const ap = await getAUMIapr();
                    setAP(ap * 100 + config.base.origin.aumi_lock);
                    setDB(DB);
                    setUB(UB);
                    setWB(fromWei(web3, walletB));
                    break;
                }
                case "QUICK": {
                    const quickC = new web3.eth.Contract(
                        cv.quick.abi,
                        cv.quick.address
                    );
                    const walletB = await quickC.methods.balanceOf(account).call();
                    const userB = await vaultC.methods.principalOf(account).call();
                    const rewards = await vaultC.methods.claimable(account).call();

                    const DB = fromWei(web3, userB);
                    const UB = DB * tokenPrices[cv.base_token.id];

                    const rPrices = await calcRewardTokenPrice(cv.rewards, tokenPrices);

                    const TR =
                        fromWei(web3, rewards._poolRewards) * Number(rPrices[0] ? rPrices[0] : 0) +
                        fromWei(web3, rewards._autoRewards) * Number(rPrices[1] ? rPrices[1] : 0);


                    setRW({
                        [cv.rewards[0]]: {
                            crypto: fromWei(web3, rewards._poolRewards),
                            usd: fromWei(web3, rewards._poolRewards) * Number(rPrices[0] ? rPrices[0] : 0)
                        },
                        [cv.rewards[1]]: {
                            crypto: fromWei(web3, rewards._autoRewards),
                            usd: fromWei(web3, rewards._autoRewards) * Number(rPrices[1] ? rPrices[1] : 0)
                        }
                    });
                    setDB(DB);
                    setUB(UB);
                    setTR(TR);

                    const ap = origin.quick * (0.7 + 0.255 * multipler);
                    setAP(ap * 100);
                    setWB(fromWei(web3, walletB));
                    break;
                }
                case "LP": {
                    const lpC = new web3.eth.Contract(
                        cv.lp.abi,
                        cv.lp.address
                    )
                    const baseTokenC = new web3.eth.Contract(
                        cv.base_token.abi,
                        cv.base_token.address
                    )
                    const walletB = await lpC.methods.balanceOf(account).call();
                    const baseTokenDecimals = await baseTokenC.methods.decimals().call();
                    const lpR = toBN(web3, (await lpC.methods.getReserves().call())[0]);
                    const totalSupply = toBN(web3, await lpC.methods.totalSupply().call());
                    const userB = toBN(web3, await vaultC.methods.principalOf(account).call());
                    const rewards = await vaultC.methods.claimable(account).call();

                    let lpPrice = fromWei(
                        web3,
                        lpR
                            .mul(toBN(web3, toWei(web3, 2 * tokenPrices[cv.base_token.id])))
                            .mul(toBN(web3, Math.pow(10, 18 - Number(baseTokenDecimals))))
                            .div(toBN(web3, totalSupply))
                    )

                    const DB = fromWei(web3, userB);
                    const UB = DB * lpPrice;

                    const rPrices = await calcRewardTokenPrice(cv.rewards, tokenPrices, lpPrice);

                    const TR =
                        fromWei(web3, rewards._poolRewards) * Number(rPrices[0] ? rPrices[0] : 0) +
                        fromWei(web3, rewards._autoRewards) * Number(rPrices[1] ? rPrices[1] : 0);

                    setRW({
                        [cv.rewards[0]]: {
                            crypto: fromWei(web3, rewards._poolRewards),
                            usd: fromWei(web3, rewards._poolRewards) * Number(rPrices[0] ? rPrices[0] : 0)
                        },
                        [cv.rewards[1]]: {
                            crypto: fromWei(web3, rewards._autoRewards),
                            usd: fromWei(web3, rewards._autoRewards) * Number(rPrices[1] ? rPrices[1] : 0)
                        }
                    });
                    setDB(DB);
                    setUB(UB);
                    setTR(TR);
                    setWB(fromWei(web3, walletB));

                    const dQuickC = new web3.eth.Contract(
                        config.base.reward.abi.dquick,
                        config.base.reward.address["D-QUICK"]
                    );
                    const dquickRate = fromWei(web3, await dQuickC.methods.dQUICKForQUICK(toWei(web3, "1")).call());
                    const secsForYear = 60 * 60 * 24 * 365;
                    switch (cv.tags[2]) {
                        case "AUMI-MATIC": {
                            switch (cv.id) {
                                case "aumi-matic-lp":
                                    setAP(1000);
                                    break;
                                case "aumi-matic-lp-compounding": {
                                    const rewardC = new web3.eth.Contract(
                                        config.base.reward.abi.reward.aumi,
                                        config.base.reward.address[cv.tags[2]]
                                    );

                                    const bts = fromWei(web3, await rewardC.methods.totalSupply().call());
                                    const rRate = fromWei(web3, await rewardC.methods.rewardRate().call());
                                    const qlp = tokenPrices['quick'] / lpPrice;

                                    const oAPR = rRate * secsForYear * qlp * dquickRate / bts;
                                    const oAPY = (1 + oAPR * 0.7 / 1095) ** 1095 - 1;

                                    const A = oAPY + cv.fee;
                                    const B = 9;

                                    // const ap = A + (1 + B / 365) ** 365 - 1;

                                    setAP((A + B) * 100);
                                    setAPD({
                                        A: A,
                                        B: B
                                    });
                                    const rate = 9 / 0.255 / A / tokenPrices["automatic-network"] * tokenPrices["matic-network"];
                                    console.log("-----", toWei(web3, rate), "-----");
                                    break;
                                }
                            }
                            break;
                        }
                        case "WBTC-ETH":
                        case "ETH-QUICK": {
                            const rewardC = new web3.eth.Contract(
                                config.base.reward.abi.reward.single,
                                config.base.reward.address[cv.tags[2]]
                            );
                            const bts = fromWei(web3, await rewardC.methods.totalSupply().call());
                            const rRate = fromWei(web3, await rewardC.methods.rewardRate().call());

                            const qlp = tokenPrices["quick"] / lpPrice;

                            const oAPR = rRate * secsForYear * qlp * dquickRate / bts;
                            const oAPY = (1 + oAPR * 0.7 / 1095) ** 1095 - 1;

                            switch (cv.tags[1]) {
                                case "COMPOUND": {
                                    const ap = cv.fee + oAPY * (1 + 0.255 * multipler);
                                    setAP(ap * 100);
                                    break;
                                }
                                case "MAX": {
                                    const ap = cv.fee + oAPY * (1 + 0.255 * multipler) * (1 - config.swapFee);
                                    setAP(ap * 100);
                                }
                            }
                            break;
                        }
                        case "MATIC-QUICK":
                        case "MATIC-ETH": {
                            const rewardC = new web3.eth.Contract(
                                config.base.reward.abi.reward.double,
                                config.base.reward.address[cv.tags[2]]
                            );
                            const qlp = tokenPrices["quick"] / lpPrice;
                            const mlp = tokenPrices["matic-network"] / lpPrice;

                            const bts = fromWei(web3, await rewardC.methods.totalSupply().call());
                            const rRateA = fromWei(web3, await rewardC.methods.rewardRateA().call());
                            const rRateB = fromWei(web3, await rewardC.methods.rewardRateB().call());


                            const oAPR_A = rRateA * secsForYear * qlp * dquickRate / bts;
                            const oAPR_B = rRateB * secsForYear * mlp / bts;

                            const oAPY = (1 + (oAPR_A + oAPR_B) * 0.7 / 1095) ** 1095 - 1;

                            switch (cv.tags[1]) {
                                case "COMPOUND": {
                                    const ap = cv.fee + oAPY * (1 + 0.255 * multipler);
                                    setAP(ap * 100);
                                    break;
                                }
                                case "MAX": {
                                    const ap = cv.fee + oAPY * (1 + 0.255 * multipler) * (1 - config.swapFee);
                                    setAP(ap * 100);
                                }
                            }
                            break;
                        }
                    }
                    break;
                }
            }
            setIL(false);
            setMC(0);
        } catch (e) {
            console.log("something went wrong! see detail here", e);
            if (mc < 10) {
                await updateData();
                setMC(mc + 1);
            }
        }
    }, [library, account, chainId]);

    const swn = () => {
        if (window.ethereum) {
            window.ethereum
                .request({
                    method: "wallet_addEthereumChain",
                    params: [
                        {
                            chainId: `0x${config.netId.toString(16)}`,
                            chainName: "Matic Network",
                            rpcUrls: [
                                "https://rpc-mainnet.maticvigil.com",
                                "https://rpc-mainnet.matic.quiknode.pro",
                                "https://matic-mainnet.chainstacklabs.com",
                            ],
                            nativeCurrency: {
                                name: "MATIC",
                                symbol: "MATIC",
                                decimals: 18,
                            },
                            blockExplorerUrls: [
                                "https://explorer-mainnet.maticvigil.com",
                            ],
                        },
                    ],
                })
                .then(() => {
                    alert(
                        "You have successfully changed to Matic Network.",
                        "info"
                    );
                })
                .catch((error) => {
                    alert(error.toString(), "error");
                });
        }
    };

    useEffect(() => {
        if (chainId === config.netId && account && library) {
            updateData();
        }
    }, [updateData, chainId, account, library]);

    return (
        <Container maxWidth="md">
            <Card className={classes.root}>
                <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => history.goBack()}>
                    Back
                </Button>
                <Typography className="title">
                    {cv.name}
                </Typography>
                <Typography className="subtitle" color="textSecondary">
                    {cv.description}
                </Typography>
                <Table className="table" aria-label="simple table">
                    <TableBody>
                        <TableRow>
                            <TableCell>{cv.ap.title}</TableCell>
                            <TableCell colSpan={2} style={{ textAlign: "right" }} className="apr_value">
                                <Box>
                                {
                                    cv.id === "aumi-matic-lp-compounding" ? (
                                        <>900% APR + {fn((apd ? apd.A : 0) * 100, 2)}% APY</>
                                    ) : (
                                        <>{isNaN(ap) ? "0%" : `${fn(ap, 2)}%`}&nbsp;</>
                                    )
                                }
                                {
                                    cv.tags[0] === "AUMI" ?
                                        <Tooltip arrow placement="top" title={<><>WMATIC APR: {fn(Number(ap) - config.base.origin.aumi_lock, 2)}%</><br /><>AUMI APR {config.base.origin.aumi_lock}%</></>}>
                                            <InfoOutlinedIcon />
                                        </Tooltip>
                                        : null
                                }
                                {/* {apd && (
                                    <Tooltip arrow placement="top" title={<><>LP APY: {fn(apd["A"] * 100, 2)}%</><br /><>AUMI APY: {fn(((1 + apd["B"] / 365) ** 365 - 1) * 100, 2)}% based on {fn(apd["B"] * 100, 2)}% APR (Manual Daily Compounding)</></>}>
                                        <InfoOutlinedIcon />
                                    </Tooltip>
                                )} */}
                                </Box>
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Deposit</TableCell>
                            <TableCell>
                                {(() => {
                                    if (!isNaN(db)) {
                                        if (db > 0 && db < 0.0001) {
                                            if (db < 10 ** -7) {
                                                return (
                                                    <Tooltip arrow title={db}>
                                                        <Typography>{fn(db, 7)}</Typography>
                                                    </Tooltip>
                                                )
                                            } else {
                                                return (
                                                    <Tooltip arrow title={db}>
                                                        <Typography>{fn(db, 4)}</Typography>
                                                    </Tooltip>
                                                )
                                            }
                                        } else {
                                            return (
                                                <Typography>{fn(db, 4)}</Typography>
                                            )
                                        }
                                    } else {
                                        return <Typography className="skelton"><Skeleton animation="wave" /></Typography>
                                    }
                                })()}
                            </TableCell>
                            <TableCell>
                                {cv.vault_token.name}
                                {cv.tags[1] === "STAKE" &&
                                    <IconButton size="small">
                                        <KeyboardArrowDownIcon className={classes.vhide} />
                                    </IconButton>
                                }
                            </TableCell>
                        </TableRow>
                        {(() => {
                            if (cv.tags[1] === "STAKE") {
                                return (
                                    <>
                                        <TableRow>
                                            <TableCell>Vest</TableCell>
                                            <TableCell>
                                                {(() => {
                                                    if (!isNaN(vb)) {
                                                        if (vb > 0 && vb < 0.0001) {
                                                            if (vb < 10 ** -7) {
                                                                return (
                                                                    <Tooltip arrow title={vb}>
                                                                        <Typography>{fn(vb, 7)}</Typography>
                                                                    </Tooltip>
                                                                )
                                                            } else {
                                                                return (
                                                                    <Tooltip arrow placement="bottom" title={vb}>
                                                                        <Typography>{fn(vb, 4)}</Typography>
                                                                    </Tooltip>
                                                                )
                                                            }
                                                        } else {
                                                            return (
                                                                <Typography>{fn(vb, 4)}</Typography>
                                                            )
                                                        }
                                                    } else {
                                                        return <Typography className="skelton"><Skeleton animation="wave" /></Typography>
                                                    }
                                                })()}
                                            </TableCell>
                                            <TableCell>
                                                {cv.vault_token.name}
                                                {cv.tags[1] === "STAKE" &&
                                                    <IconButton disabled={vi.length === 0} onClick={() => setIVO(!ivo)} size="small">
                                                        {ivo ? <KeyboardArrowUpIcon className={vi.length ? "" : classes.vhide} />
                                                            : <KeyboardArrowDownIcon className={vi.length ? "" : classes.vhide} />}
                                                    </IconButton>
                                                }
                                            </TableCell>
                                        </TableRow>
                                        {
                                            vi.length > 0 && (
                                                <TableRow>
                                                    <TableCell style={{ padding: 0 }} colSpan={3}>
                                                        <Collapse in={ivo} timeout="auto" unmountOnExit>
                                                            <Table size="small">
                                                                <TableHead>
                                                                    <TableRow>
                                                                        <TableCell>Amount</TableCell>
                                                                        <TableCell align="right">Unlock Time</TableCell>
                                                                    </TableRow>
                                                                </TableHead>
                                                                <TableBody>
                                                                    {vi.map((item, idx) => {
                                                                        return (
                                                                            <TableRow key={idx}>
                                                                                {(() => {
                                                                                    const balance = fn(item.amount / Math.pow(10, 18), 4);
                                                                                    if (balance < 0.0001) {
                                                                                        return (
                                                                                            <Tooltip arrow title={item.amount / Math.pow(10, 18)}>
                                                                                                <TableCell>{balance} AUMI</TableCell>
                                                                                            </Tooltip>
                                                                                        )
                                                                                    } else {
                                                                                        return (
                                                                                            <TableCell>{balance} AUMI</TableCell>
                                                                                        )
                                                                                    }
                                                                                })()}
                                                                                <TableCell align="right">{new Date(item.unlockTime * 1000).toLocaleString()}</TableCell>
                                                                            </TableRow>
                                                                        )
                                                                    })}
                                                                </TableBody>
                                                            </Table>
                                                        </Collapse>
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        }
                                    </>
                                )
                            }
                        })()}
                        <TableRow>
                            <TableCell>Profits</TableCell>
                            <TableCell>
                                {Object.keys(rw).map((i, ix) => {
                                    if (i === "")
                                        return;
                                    if (Number(rw[i].crypto) < 0.0001 && Number(rw[i].crypto) > 0) {
                                        return (
                                            <Tooltip key={ix} arrow title={`${i}: ${rw[i].crypto}`}>
                                                <Typography>{fn(rw[i].crypto)}{" "}{i}</Typography>
                                            </Tooltip>
                                        )
                                    } else
                                        return <Typography key={ix} > {fn(rw[i].crypto)}{" "}{i}</Typography>
                                })}
                            </TableCell>
                            <TableCell>
                                {(() => {
                                    if (cv.id === "aumi-matic-lp-compounding") {
                                        return (
                                            <ButtonGroup orientation={isMobile ? "vertical" : "horizontal"}>
                                                <Button
                                                    onClick={() => claim()}
                                                    color="primary"
                                                    variant="outlined"
                                                    disabled={chainId === 137 ? false : true}
                                                >
                                                    Claim
                                                </Button>
                                                <Button
                                                    onClick={() => vest()}
                                                    color="primary"
                                                    variant="outlined"
                                                    disabled={chainId === 137 ? false : true}
                                                >
                                                    Claim AUMI
                                                </Button>
                                            </ButtonGroup>
                                        )
                                    } else {
                                        if (cv.tags[0] === "QUICK") {
                                            return (
                                                <Tooltip arrow title="Vested AUMI will be locked for 3 months. If you withdraw early, you will be charged 50% penalty.">
                                                    <Button
                                                        onClick={() => claim()}
                                                        color="primary"
                                                        variant="outlined"
                                                    >
                                                        Claim & Vest
                                                    </Button>
                                                </Tooltip>
                                            )
                                        } else if (cv.tags[0] === "AUMI") {
                                            return (
                                                <Stack spacing={1} my={1} className="aumi_reward_btn">
                                                    <Button
                                                        onClick={() => claim()}
                                                        color="primary"
                                                        variant="outlined"
                                                        disabled={chainId === 137 ? false : true}
                                                    >
                                                        CLAIM WMATIC
                                                    </Button>
                                                    <Tooltip arrow title="Claim WMATIC before you claim AUMI.">
                                                        <Button
                                                            onClick={() => claim_aumi()}
                                                            color="primary"
                                                            variant="outlined"
                                                            disabled={chainId === 137 ? false : true}
                                                        >
                                                            CLAIM AUMI
                                                        </Button>
                                                    </Tooltip>
                                                </Stack>
                                            )
                                        } else {
                                            return (
                                                <Button
                                                    onClick={() => claim()}
                                                    color="primary"
                                                    variant="outlined"
                                                    disabled={chainId === 137 ? false : true}
                                                >
                                                    Claim
                                                </Button>
                                            )
                                        }
                                    }
                                })()}
                            </TableCell>
                        </TableRow>

                    </TableBody>
                </Table>
                <Tabs
                    value={at}
                    className="tabs"
                    indicatorColor="primary"
                    variant="fullWidth"
                    onChange={hat}
                >
                    <Tab label="Deposit" />
                    <Tab label="Withdraw" />
                </Tabs>
                <Typography className="feeDescription" color="textSecondary">
                    {cv.fee_description}
                </Typography>
                <TextField
                    id="am"
                    variant="outlined"
                    fullWidth
                    value={am}
                    color="secondary"
                    className="input"
                    InputProps={{
                        placeholder: "0",
                        endAdornment: (
                            <InputAdornment
                                position="end"
                                className="max-pattern"
                            >
                                <Tooltip arrow title={cv.vault_token.address}>
                                    <Typography>
                                        {cv.vault_token.name}
                                    </Typography>
                                </Tooltip>
                                <Button
                                    onClick={() => smb(wb, cv.tags[1] === "STAKE" ? wbwp : db)}
                                    color="primary"
                                    variant="contained"
                                    disabled={il ? true : false}
                                >
                                    {il ? (
                                        <CircularProgress size={24} />
                                    ) : (
                                        "MAX"
                                    )}
                                </Button>
                            </InputAdornment>
                        ),
                    }}
                    onChange={(e) => setAM(e.target.value)}
                    helperText={
                        (() => {
                            if (cv.tags[1] === "STAKE" && at === 1) {
                                return (
                                    <>
                                        <Typography variant="caption" noWrap>
                                            Withdrawable with 50% penalty:{" "}
                                            {Number(wbwp).toFixed(4) < 0.0001 ? wbwp : fn(wbwp, 4)}
                                        </Typography>
                                        <br></br>
                                        <Typography variant="caption" noWrap>
                                            Withdrawable without 50% penalty:{" "}
                                            {Number(wbwop).toFixed(4) < 0.0001 ? wbwop : fn(wbwop, 4)}
                                        </Typography>
                                    </>
                                )
                            } else {
                                return (
                                    <>Wallet Balance : {Number(wb).toFixed(4) < 0.0001 ? wb : fn(wb, 4)}</>
                                )
                            }
                        })()
                    }
                />
                <Box className="balance">
                    <Typography className="title">
                        Your Balance
                    </Typography>
                    <Typography className="value">
                        {(() => {
                            const fb = Number(ub) + Number(tr);
                            if (fb < 0.01 && fb > 0) {
                                return (
                                    <Tooltip arrow title={fb}>
                                        <Box component="span">${fn(fb, 4)}</Box>
                                    </Tooltip>
                                )
                            } else {
                                return <>${fn(fb, 4)}</>
                            }
                        })()}
                    </Typography>
                </Box>
                <Box className="checkout">
                    {(() => {
                        if (!account) {
                            return (
                                <Button
                                    fullWidth
                                    variant="contained"
                                    color="primary"
                                    onClick={() => {
                                        setOWL(true);
                                    }}
                                >
                                    Connect Wallet
                                </Button>
                            )
                        } else {
                            if (chainId === config.netId) {
                                if (at === 0) {
                                    if (cv.tags[1] === "STAKE") {
                                        return (
                                            <Tooltip arrow title="Vested AUMI will be locked for 3 months. If you withdraw early, you will be charged 50% penalty">
                                                <Button
                                                    variant="contained"
                                                    color="primary"
                                                    onClick={() => deposit()}
                                                    disabled={il ? true : false}
                                                >
                                                    {il ? (
                                                        <CircularProgress size={28} />
                                                    ) : (
                                                        "Deposit"
                                                    )}
                                                </Button>
                                            </Tooltip>
                                        )
                                    } else {
                                        return (
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                onClick={() => deposit()}
                                                disabled={il ? true : false}
                                            >
                                                {il ? (
                                                    <CircularProgress size={28} />
                                                ) : (
                                                    "Deposit"
                                                )}
                                            </Button>
                                        )
                                    }
                                } else {
                                    return (
                                        <Box className="buttonGroup">
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                onClick={() => withdraw()}
                                                disabled={il ? true : false}
                                            >
                                                {il ? (
                                                    <CircularProgress size={28} />
                                                ) : (
                                                    "Withdraw"
                                                )}
                                            </Button>
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                onClick={() => withdrawAll()}
                                                disabled={il ? true : false}
                                            >
                                                {il ? (
                                                    <CircularProgress size={28} />
                                                ) : (
                                                    "Withdraw All"
                                                )}
                                            </Button>
                                        </Box>
                                    )
                                }
                            } else {
                                return (
                                    <Button
                                        onClick={swn}
                                        variant="contained"
                                        color="primary"
                                    >
                                        Please Switch To Matic Network
                                    </Button>
                                )
                            }
                        }
                    })()}
                </Box>
            </Card>
            <ConnectWallet
                isOpen={owl}
                setIsOpen={setOWL}
            />
        </Container >
    );

}

export default Pool;