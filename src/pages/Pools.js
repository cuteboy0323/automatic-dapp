import React, { useEffect, useState, useCallback } from "react";

import clsx from "clsx";

// ** Import Web3
import Web3 from "web3";
import { useWeb3React } from "@web3-react/core";

// ** Import Material UI Components
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Table from "@mui/material/Table";
import Tooltip from "@mui/material/Tooltip";
import Skeleton from '@mui/material/Skeleton';
import TableRow from "@mui/material/TableRow";
import TableBody from "@mui/material/TableBody";
import Container from "@mui/material/Container";
import TableCell from "@mui/material/TableCell";
import Typography from "@mui/material/Typography";
import CardContent from "@mui/material/CardContent";
import useMediaQuery from "@mui/material/useMediaQuery";
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
// ** Import Assets
import useStyles from "../assets/styles";

import config from "../config/app";

import { useHistory } from "react-router-dom";
import { useApi } from "../hooks";

import FilterListIcon from '@mui/icons-material/FilterList';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import SortIcon from '@mui/icons-material/Sort';
import VerticalAlignBottomIcon from '@mui/icons-material/VerticalAlignBottom';
import VerticalAlignTopIcon from '@mui/icons-material/VerticalAlignTop';
import WrapTextIcon from '@mui/icons-material/WrapText';
import ShoppingCartRoundedIcon from '@mui/icons-material/ShoppingCartRounded';

const Pools = () => {
    const api = useApi();
    const history = useHistory();
    const classes = useStyles.pools();
    const isMobile = useMediaQuery("(max-width:600px)");

    const [ap, setAp] = useState({});
    const [apData, setApData] = useState({});
    const [eachBalance, setEachBalance] = useState(0);
    const [totalRewards, setTotalRewards] = useState(0);
    const [totalEarned, setTotalEarned] = useState({});
    const [totalDeposit, setTotalDeposit] = useState([]);
    const [totalMarketCap, setTotalMarketCap] = useState();
    const [burntAmount, setBurntAmount] = useState();
    const [filter, setFilter] = useState([]);
    const [search, setSearch] = useState("");
    const [stakedOnly, setStakedOnly] = useState(false);
    const [sortAnchorEl, setSortAnchorEl] = useState(null);
    const [filterAnchorEl, setFilterAnchorEl] = useState(null);

    const { account, library, chainId } = useWeb3React();

    const isOpenSortMenu = Boolean(sortAnchorEl);
    const isOpenFilterMenu = Boolean(filterAnchorEl);

    // ** Actions
    const handleClickSortMenu = (event) => {
        setSortAnchorEl(event.currentTarget);
    };
    const handleCloseSortMenu = () => {
        setSortAnchorEl(null);
    };
    const handleClickFilterMenu = (event) => {
        setFilterAnchorEl(event.currentTarget);
    };
    const handleCloseFilterMenu = () => {
        setFilterAnchorEl(null);
    };
    const handleChangeStakedOnly = (event) => {
        setStakedOnly(event.target.checked);
    };
    const fn = (val, decimal = 4) => {
        if (!isNaN(Number(val))) {
            const trimVal = Number(Number(val).toFixed(decimal));
            const decimalVal = trimVal.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
            return decimalVal;
        } else {
            return Number(0);
        }
    }
    const updateTotalDeposit = () => {
        let sum = 0;
        for (let i in totalDeposit) {
            sum += Number(totalDeposit[i]);
        }
        return sum;
    };
    const updateTotalEarned = () => {
        let sum = 0;
        for (let i in totalEarned) {
            sum += Number(totalEarned[i]);
        }
        return sum;
    };

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
                    return 0
                }
            }
        }
        return result;
    }

    const sortVaults = (sortBy, direction) => {
        switch (sortBy) {
            case "DEF": {
                const vaultsDOM = document.getElementById("vault-list");
                for (let i = 1; i < vaultsDOM.children.length; i++) {
                    const child = vaultsDOM.children;
                    child[i].style.order = i;
                }
                break;
            }
            case "TVL": {
                let tvl_sorted;
                if (direction === "DESC") {
                    tvl_sorted = Object.entries(totalDeposit).sort((a, b) => b[1] - a[1]);
                } else {
                    tvl_sorted = Object.entries(totalDeposit).sort((a, b) => a[1] - b[1]);
                }
                const vaultsDOM = document.getElementById("vault-list");
                for (let index in tvl_sorted) {
                    const child = vaultsDOM.children;
                    for (let i = 1; i < child.length; i++) {
                        if (tvl_sorted[index][0] === child[i].id) {
                            child[i].style.order = index;
                        }
                    }
                }
                break;
            }
            case "APY": {
                let apys_sorted;
                if (direction === "DESC") {
                    apys_sorted = Object.entries(ap).sort((a, b) => b[1] - a[1]);
                } else {
                    apys_sorted = Object.entries(ap).sort((a, b) => a[1] - b[1]);
                }
                const vaultsDOM = document.getElementById("vault-list");
                for (let index in apys_sorted) {
                    const child = vaultsDOM.children;
                    for (let i = 1; i < child.length; i++) {
                        if (apys_sorted[index][0] === child[i].id) {
                            child[i].style.order = index;
                        }
                    }
                }
            }
        }
        handleCloseSortMenu();
    };

    const filterVaults = (key) => {
        if (filter.find(item => item === key)) {
            setFilter(prevState => {
                const index = prevState.findIndex(i => i === key);
                prevState.splice(index, 1);
                return [
                    ...prevState
                ]
            });
        } else {
            setFilter(prevState => {
                return [
                    ...prevState,
                    key
                ]
            })
        }
    }

    const getLP = (e, item) => {
        e.stopPropagation();
        console.log("button", item);
    }

    const updateData = async () => {
        try {
            const web3 = new Web3(library.provider);
            const tokenPrices = await updateTokenPrices();

            const { origin } = config.base;

            const getTotalMarketCap = async () => {
                try {
                    const burnAddress = "0x000000000000000000000000000000000000dEaD";
                    const teamAllocation = 25000;
                    // calc total marketcap
                    const aumiC = new web3.eth.Contract(
                        config.aumi.abi,
                        config.aumi.address
                    );
                    const burntAmount = await aumiC.methods.balanceOf(burnAddress).call();
                    const totalSupply = await aumiC.methods.totalSupply().call();
                    setBurntAmount(fromWei(web3, burntAmount));
                    const iTM =
                        (toBN(web3, totalSupply)
                            .sub(toBN(web3, toWei(web3, teamAllocation)))
                            .sub(toBN(web3, burntAmount)))
                            .mul(toBN(web3, toWei(web3, tokenPrices["automatic-network"])))
                            .div(toBN(web3, toWei(web3, "1")));

                    const TM = fromWei(web3, iTM);
                    return TM;
                } catch (e) {
                    const TM = await getTotalMarketCap();
                    setTotalMarketCap(TM);
                    return false;
                }
            }

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

            const TM = await getTotalMarketCap();
            TM && setTotalMarketCap(TM);

            // calc vaults
            config.contracts.map(async (item) => {
                const rPrices = calcRewardTokenPrice(item.rewards, tokenPrices);
                const vaultC = new web3.eth.Contract(
                    item.vault.abi,
                    item.vault.address
                );

                const multipler = tokenPrices["automatic-network"] * item.mint.rate / tokenPrices["matic-network"];

                switch (item.tags[0]) {
                    case "AUMI": {
                        const userB = await vaultC.methods.balanceOf(account).call();
                        const rewards = await vaultC.methods.claimable(account).call();
                        const UB = fromWei(web3, userB) * tokenPrices[item.base_token.id];
                        const vaultB = await vaultC.methods.totalSupply().call();
                        const TD = fromWei(web3, vaultB) * tokenPrices[item.base_token.id];
                        const ap = await getAUMIapr();
                        const secsForYear = toBN(web3, 60 * 60 * 24);
                        const rewardData = await vaultC.methods.rewardData("0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270").call()
                        const rewardRate = toBN(web3, rewardData.rewardRate);
                        const bmp = toBN(web3, toWei(web3, tokenPrices["matic-network"]));
                        const adp = fromWei(web3, rewardRate.mul(secsForYear).mul(bmp).div(toBN(web3, toWei(web3, "1"))));

                        const TR =
                            fromWei(web3, rewards.totalReward) * rPrices[0] ? rPrices[0] : 0 +
                                fromWei(web3, rewards.lockedReward) * rPrices[1] ? rPrices[1] : 0;

                        setTotalDeposit((prevState) => ({ ...prevState, [item.id]: TD, }));
                        setTotalRewards((prevState) => ({ ...prevState, [item.id]: TR, }));
                        setAp((prevState) => ({ ...prevState, [item.id]: ap * 100 }));
                        setEachBalance((prevState) => ({ ...prevState, [item.id]: UB, }));
                        setTotalEarned((prevState) => ({ ...prevState, [item.id]: adp, }));
                        break;
                    }
                    case "QUICK": {
                        const vaultB = await vaultC.methods.totalSupply().call();
                        const userB = await vaultC.methods.principalOf(account).call();
                        const rewards = await vaultC.methods.claimable(account).call();
                        const earned = await vaultC.methods.totalEarned().call();

                        const UB = fromWei(web3, userB) * tokenPrices[item.base_token.id];
                        const TD = fromWei(web3, vaultB) * tokenPrices[item.base_token.id];
                        const TR =
                            fromWei(web3, rewards._poolrewards) * rPrices[0] ? rPrices[0] : 0 +
                                fromWei(web3, rewards._autoRewards) * rPrices[1] ? rPrices[1] : 0;
                        const TE = fromWei(web3, earned.usdAmount);


                        setTotalDeposit((prevState) => ({ ...prevState, [item.id]: TD, }));
                        setTotalRewards((prevState) => ({ ...prevState, [item.id]: TR, }));
                        setEachBalance((prevState) => ({ ...prevState, [item.id]: UB, }));
                        setTotalEarned((prevState) => ({ ...prevState, [item.id]: TE, }));

                        const ap = origin.quick * (0.7 + 0.255 * multipler);
                        setAp((prevState) => ({ ...prevState, [item.id]: ap * 100 }));
                        break;
                    }
                    case "LP": {
                        const lpC = new web3.eth.Contract(
                            item.lp.abi,
                            item.lp.address
                        )
                        const baseTokenC = new web3.eth.Contract(
                            item.base_token.abi,
                            item.base_token.address
                        )
                        const baseTokenDecimals = await baseTokenC.methods.decimals().call();
                        const vaultB = toBN(web3, await vaultC.methods.totalSupply().call());
                        const lpR = toBN(web3, (await lpC.methods.getReserves().call())[0]);
                        const totalSupply = toBN(web3, await lpC.methods.totalSupply().call());
                        const userB = toBN(web3, await vaultC.methods.principalOf(account).call());
                        const rewards = await vaultC.methods.claimable(account).call();
                        const earned = await vaultC.methods.totalEarned().call();
                        let lpPrice = fromWei(
                            web3,
                            lpR
                                .mul(toBN(web3, toWei(web3, 2 * tokenPrices[item.base_token.id])))
                                .mul(toBN(web3, Math.pow(10, 18 - Number(baseTokenDecimals))))
                                .div(toBN(web3, totalSupply))
                        )

                        const TD = fromWei(web3, vaultB) * lpPrice;
                        const UB = fromWei(web3, userB) * lpPrice;
                        const TE = fromWei(web3, earned.usdAmount);
                        const TR =
                            fromWei(web3, rewards._poolrewards) * rPrices[0] ? rPrices[0] : 0 +
                                fromWei(web3, rewards._autoRewards) * rPrices[1] ? rPrices[1] : 0;

                        setTotalDeposit((prevState) => ({ ...prevState, [item.id]: TD, }));
                        setTotalRewards((prevState) => ({ ...prevState, [item.id]: TR, }));
                        setEachBalance((prevState) => ({ ...prevState, [item.id]: UB, }));
                        setTotalEarned((prevState) => ({ ...prevState, [item.id]: TE, }));

                        const dQuickC = new web3.eth.Contract(
                            config.base.reward.abi.dquick,
                            config.base.reward.address["D-QUICK"]
                        );
                        const dquickRate = fromWei(web3, await dQuickC.methods.dQUICKForQUICK(toWei(web3, "1")).call());
                        const secsForYear = 60 * 60 * 24 * 365;
                        switch (item.tags[2]) {
                            case "AUMI-MATIC": {
                                switch (item.id) {
                                    case "aumi-matic-lp":
                                        setAp((prevState) => ({ ...prevState, [item.id]: 1000 }));
                                        break;
                                    case "aumi-matic-lp-compounding": {
                                        const rewardC = new web3.eth.Contract(
                                            config.base.reward.abi.reward.aumi,
                                            config.base.reward.address[item.tags[2]]
                                        );

                                        const bts = fromWei(web3, await rewardC.methods.totalSupply().call());
                                        const rRate = fromWei(web3, await rewardC.methods.rewardRate().call());
                                        const qlp = tokenPrices['quick'] / lpPrice;

                                        const oAPR = rRate * secsForYear * qlp * dquickRate / bts;
                                        const oAPY = (1 + oAPR * 0.7 / 1095) ** 1095 - 1;

                                        const A = oAPY + item.fee;
                                        const B = 9;

                                        // const ap = A + (1 + B / 365) ** 365 - 1;

                                        const rate = 9 / 0.255 / A / tokenPrices["automatic-network"] * tokenPrices["matic-network"];
                                        console.log("-----", toWei(web3, rate), "-----");
                                        setAp((prevState) => ({ ...prevState, [item.id]: (B + A) * 100 }));
                                        setApData((prevState) => ({
                                            ...prevState, [item.id]: {
                                                A: A,
                                                B: B
                                            }
                                        }))
                                        break;
                                    }
                                }
                                break;
                            }
                            case "WBTC-ETH":
                            case "ETH-QUICK": {
                                const rewardC = new web3.eth.Contract(
                                    config.base.reward.abi.reward.single,
                                    config.base.reward.address[item.tags[2]]
                                );
                                const bts = fromWei(web3, await rewardC.methods.totalSupply().call());
                                const rRate = fromWei(web3, await rewardC.methods.rewardRate().call());

                                const qlp = tokenPrices["quick"] / lpPrice;

                                const oAPR = rRate * secsForYear * qlp * dquickRate / bts;
                                const oAPY = (1 + oAPR * 0.7 / 1095) ** 1095 - 1;

                                switch (item.tags[1]) {
                                    case "COMPOUND": {
                                        const ap = item.fee + oAPY * (1 + 0.255 * multipler);
                                        setAp((prevState) => ({ ...prevState, [item.id]: ap * 100 }));
                                        break;
                                    }
                                    case "MAX": {
                                        const ap = item.fee + oAPY * (1 + 0.255 * multipler) * (1 - config.swapFee);
                                        setAp((prevState) => ({ ...prevState, [item.id]: ap * 100 }));
                                    }
                                }
                                break;
                            }
                            case "MATIC-QUICK":
                            case "MATIC-ETH": {
                                const rewardC = new web3.eth.Contract(
                                    config.base.reward.abi.reward.double,
                                    config.base.reward.address[item.tags[2]]
                                );
                                const qlp = tokenPrices["quick"] / lpPrice;
                                const mlp = tokenPrices["matic-network"] / lpPrice;

                                const bts = fromWei(web3, await rewardC.methods.totalSupply().call());
                                const rRateA = fromWei(web3, await rewardC.methods.rewardRateA().call());
                                const rRateB = fromWei(web3, await rewardC.methods.rewardRateB().call());


                                const oAPR_A = rRateA * secsForYear * qlp * dquickRate / bts;
                                const oAPR_B = rRateB * secsForYear * mlp / bts;

                                const oAPY = (1 + (oAPR_A + oAPR_B) * 0.7 / 1095) ** 1095 - 1;

                                switch (item.tags[1]) {
                                    case "COMPOUND": {
                                        const ap = item.fee + oAPY * (1 + 0.255 * multipler);
                                        setAp((prevState) => ({ ...prevState, [item.id]: ap * 100 }));
                                        break;
                                    }
                                    case "MAX": {
                                        const ap = item.fee + oAPY * (1 + 0.255 * multipler) * (1 - config.swapFee);
                                        setAp((prevState) => ({ ...prevState, [item.id]: ap * 100 }));
                                    }
                                }
                                break;
                            }
                        }
                        break;
                    }
                }
            });
        } catch (e) {
            console.log(e.toString());
            await updateData();
        }
    }

    useEffect(() => {
        let interval = null;
        if (chainId === config.netId && account && library) {
            updateData();
            interval = setInterval(async () => {
                await updateData();
                console.clear();
            }, config.updateTime);
        }
        return () => clearInterval(interval);
    }, [account, library, chainId]);

    return (
        <Container className={classes.root} maxWidth="lg">
            <Box className={classes.info}>
                <Grid container spacing={3}>
                    <Grid className={isMobile ? "mobileGrid" : "grid"} item xs={12} sm={3} md={6} >
                        <Card className="card">
                            <CardContent>
                                <Typography className="title" color="textSecondary">
                                    TOTAL DEPOSITED
                                </Typography>
                                <Typography className="value big" color="primary">
                                    ${fn(updateTotalDeposit(), 2)}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid className={isMobile ? "mobileGrid" : "grid"} item xs={12} sm={3} md={6} >
                        <Card className="card">
                            <CardContent>
                                <Typography className="title" color="textSecondary">
                                    AUMI MARKET CAP
                                </Typography>
                                {(() => {
                                    if (totalMarketCap) {
                                        return (
                                            <Typography className="value big" color="primary">
                                                ${fn(totalMarketCap, 2)}
                                            </Typography>
                                        )
                                    } else {
                                        return <Typography className="skelton"><Skeleton animation="wave" /></Typography>
                                    }
                                })()}
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid className={isMobile ? "mobileGrid" : "grid"} item xs={12} sm={3} md={6} >
                        <Card className="card">
                            <CardContent>
                                <Typography className="title" color="textSecondary">
                                    BURNT
                                </Typography>
                                {(() => {
                                    if (burntAmount) {
                                        return (
                                            <Typography className="value big" color="primary">
                                                {fn(burntAmount, 2)} AUMI
                                            </Typography>
                                        )
                                    } else {
                                        return <Typography className="skelton"><Skeleton animation="wave" /></Typography>
                                    }
                                })()}
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid className={isMobile ? "mobileGrid" : "grid"} item xs={12} sm={3} md={6} >
                        <Card className="card">
                            <CardContent>
                                <Typography className="title" color="textSecondary">
                                    DAILY PROFITS
                                </Typography>
                                <Typography className="value big" color="primary">
                                    ${fn(updateTotalEarned(), 2)}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Box>
            <Box className={isMobile ? "tools mobile" : "tools"}>
                <Card className="card">
                    <CardContent>
                        {!isMobile &&
                            <FormGroup>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={stakedOnly}
                                            onChange={handleChangeStakedOnly}
                                        />
                                    }
                                    label="Staked only"
                                />
                            </FormGroup>
                        }
                        <Box>
                            {isMobile &&
                                <FormGroup>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={stakedOnly}
                                                onChange={handleChangeStakedOnly}
                                            />
                                        }
                                        label="Staked only"
                                    />
                                </FormGroup>
                            }
                            {!isMobile &&
                                <TextField
                                    className="search"
                                    color="primary"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    InputProps={{
                                        placeholder: "Search...",
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchRoundedIcon color="primary" />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            }
                            <Button
                                id="filter-button"
                                aria-controls="filter-menu"
                                aria-haspopup="true"
                                aria-expanded={isOpenFilterMenu ? 'true' : undefined}
                                onClick={handleClickFilterMenu}
                                variant="outlined"
                                style={{
                                    marginRight: 8
                                }}
                                endIcon={
                                    <FilterListIcon />
                                }
                            >
                                Filter
                            </Button>
                            <Menu
                                id="filter-menu"
                                className={classes.filterMenu}
                                anchorEl={filterAnchorEl}
                                open={isOpenFilterMenu}
                                onClose={handleCloseFilterMenu}
                                MenuListProps={{
                                    'aria-labelledby': 'filter-button',
                                }}
                            >
                                <MenuItem onClick={() => filterVaults("aumi-vaults")}>
                                    <ListItemIcon>
                                        <Checkbox
                                            checked={filter.find(item => item === "aumi-vaults") ? true : false}
                                        />
                                    </ListItemIcon>
                                    <ListItemText>AUMI Vaults</ListItemText>
                                </MenuItem>
                                <MenuItem onClick={() => filterVaults("single-assets")}>
                                    <ListItemIcon>
                                        <Checkbox
                                            checked={filter.find(item => item === "single-assets") ? true : false}
                                        />
                                    </ListItemIcon>
                                    <ListItemText>Single Assets</ListItemText>
                                </MenuItem>
                                <MenuItem onClick={() => filterVaults("liquidity-pools")}>
                                    <ListItemIcon>
                                        <Checkbox
                                            checked={filter.find(item => item === "liquidity-pools") ? true : false}
                                        />
                                    </ListItemIcon>
                                    <ListItemText>Liquidity Pools</ListItemText>
                                </MenuItem>
                            </Menu>
                            <Button
                                id="sort-button"
                                aria-controls="sort-menu"
                                aria-haspopup="true"
                                aria-expanded={isOpenSortMenu ? 'true' : undefined}
                                onClick={handleClickSortMenu}
                                variant="outlined"
                                endIcon={
                                    <SortIcon />
                                }
                            >
                                Sort
                            </Button>
                            <Menu
                                id="sort-menu"
                                className={classes.sortMenu}
                                anchorEl={sortAnchorEl}
                                open={isOpenSortMenu}
                                onClose={handleCloseSortMenu}
                                MenuListProps={{
                                    'aria-labelledby': 'sort-button',
                                }}
                            >
                                <MenuItem onClick={() => sortVaults("TVL", "ASC")}>
                                    <ListItemText>TVL</ListItemText>
                                    <IconButton size="small">
                                        <VerticalAlignBottomIcon />
                                    </IconButton>
                                </MenuItem>
                                <MenuItem onClick={() => sortVaults("TVL", "DESC")}>
                                    <ListItemText>TVL</ListItemText>
                                    <IconButton size="small">
                                        <VerticalAlignTopIcon />
                                    </IconButton>
                                </MenuItem>
                                <MenuItem onClick={() => sortVaults("APY", "ASC")}>
                                    <ListItemText>APY</ListItemText>
                                    <IconButton size="small">
                                        <VerticalAlignBottomIcon />
                                    </IconButton>
                                </MenuItem>
                                <MenuItem onClick={() => sortVaults("APY", "DESC")}>
                                    <ListItemText>APY</ListItemText>
                                    <IconButton size="small">
                                        <VerticalAlignTopIcon />
                                    </IconButton>
                                </MenuItem>
                                <MenuItem onClick={() => sortVaults("DEF")}>
                                    <ListItemText>DEF</ListItemText>
                                    <IconButton size="small">
                                        <WrapTextIcon />
                                    </IconButton>
                                </MenuItem>
                            </Menu>
                        </Box>
                        {isMobile &&
                            <TextField
                                className="search"
                                color="primary"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                InputProps={{
                                    placeholder: "Search...",
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchRoundedIcon color="primary" />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        }
                    </CardContent>
                </Card>
            </Box>
            <Card className={classes.pools}>
                <CardContent>
                    <Grid id="vault-list" container justify="center" spacing={3}>
                        {config.contracts.map((item, idx) => {
                            const flag = filter.find(i => i === item.filter);
                            if (filter.length !== 0 && !flag) {
                                return <React.Fragment key={idx} />
                            }
                            if (stakedOnly && Number(eachBalance[item.id]) <= 0) {
                                return <React.Fragment key={idx} />
                            }
                            if (item.name.toLowerCase().indexOf(search.toLowerCase()) === -1) {
                                return <React.Fragment key={idx} />
                            }
                            if (item.tags[0] === "AUMI") {
                                return (
                                    <Grid id={item.id} key={idx} item xs={12}>
                                        <Card
                                            className={clsx("pool", {
                                                mobilePool: isMobile,
                                            })}
                                            onClick={() => history.push(`/pools/${item.id}`)}
                                        >
                                            <CardContent>
                                                <Grid className="grid" container>
                                                    <Grid className="cell" item xs={12} sm={6} md={4}>
                                                        <Box className="pool-img">
                                                            {item.icons.map((icon, index) => (
                                                                <img key={index} src={icon} alt={icon} />
                                                            ))}
                                                        </Box>
                                                        <Box className="pool-title">
                                                            <Typography className="title">
                                                                {item.name}
                                                            </Typography>
                                                            <Typography
                                                                color="textSecondary"
                                                                className="description"
                                                            >
                                                                {item.sub_title}
                                                            </Typography>
                                                        </Box>
                                                        <Typography className={isMobile ? "percentage" : classes.hide}>
                                                            {item.ap.title} {" "} {isNaN(ap[item.id]) ? "0%" : `${fn(Number(ap[item.id]) + config.base.origin.aumi_lock, 2)}%`}&nbsp;
                                                            <Tooltip arrow placement="top" title={<><>WMATIC APR: {isNaN(ap[item.id]) ? "0%" : `${fn(Number(ap[item.id]), 2)}%`}</><br /><>AUMI APR: {config.base.origin.aumi_lock}%</></>}>
                                                                <InfoOutlinedIcon />
                                                            </Tooltip>
                                                        </Typography>
                                                    </Grid>
                                                    <Grid className={isMobile ? classes.hide : "cell"} item xs={12} sm={4}>
                                                        <Typography className="percentage">
                                                            {item.ap.title}{" "}{isNaN(ap[item.id]) ? "0%" : `${fn(Number(ap[item.id]) + config.base.origin.aumi_lock, 2)}%`}&nbsp;
                                                            <Tooltip arrow placement="top" title={<><>WMATIC APR: {isNaN(ap[item.id]) ? "0%" : `${fn(Number(ap[item.id]), 2)}%`}</><br /><>AUMI APR: {config.base.origin.aumi_lock}%</></>}>
                                                                <InfoOutlinedIcon />
                                                            </Tooltip>
                                                        </Typography>
                                                        <Typography
                                                            className="comment"
                                                            color="textSecondary"
                                                        >
                                                            {item.description}
                                                        </Typography>
                                                    </Grid>
                                                    <Grid className="cell" item xs={12} sm={4}>
                                                        <Box className={isMobile ? "row" : classes.hide}>
                                                            <Typography className="target">
                                                                {item.description}
                                                            </Typography>
                                                        </Box>
                                                        <Box className="row">
                                                            <Typography>Earn</Typography>
                                                            <Typography>
                                                                {item.rewards[0]}{(item.rewards[0] !== "" && item.rewards[1] !== "") && " + "}{item.rewards[1]}
                                                            </Typography>
                                                        </Box>
                                                        <Box className="row">
                                                            <Typography>Balance</Typography>
                                                            {(() => {
                                                                const balance = Number(eachBalance[item.id]) + Number(totalRewards[item.id]);
                                                                if (!isNaN(balance)) {
                                                                    if (balance > 0 && balance < 0.01) {
                                                                        return (
                                                                            <Tooltip arrow placement="top" title={<>{balance}</>}>
                                                                                <Typography>${fn(balance, 2)}</Typography>
                                                                            </Tooltip>
                                                                        )
                                                                    } else {
                                                                        return (
                                                                            <Typography>${fn(balance, 2)}</Typography>
                                                                        )
                                                                    }
                                                                } else {
                                                                    return <Typography className="skelton"><Skeleton animation="wave" /></Typography>
                                                                }
                                                            })()}
                                                        </Box>
                                                        <Box className="row">
                                                            <Typography>
                                                                Total Deposit
                                                            </Typography>
                                                            {(() => {
                                                                const tDbalance = Number(totalDeposit[item.id]);
                                                                if (!isNaN(tDbalance)) {
                                                                    if (tDbalance > 0 && tDbalance < 0.01) {
                                                                        return (
                                                                            <Tooltip arrow placement="bottom" title={totalDeposit[item.id]}>
                                                                                <Typography>${fn(tDbalance, 2)}</Typography>
                                                                            </Tooltip>
                                                                        )
                                                                    } else {
                                                                        return (
                                                                            <Typography>${fn(tDbalance, 2)}</Typography>
                                                                        )
                                                                    }
                                                                } else {
                                                                    return <Typography className="skelton"><Skeleton animation="wave" /></Typography>
                                                                }
                                                            })()}
                                                        </Box>
                                                    </Grid>
                                                </Grid>
                                            </CardContent>
                                        </Card>
                                        {idx === 1 && <><br /><br /><br /></>}
                                    </Grid>
                                )
                            } else {
                                return (
                                    <Grid id={item.id} key={idx} className="lp-pools" item xs={12} sm={6} md={4}>
                                        <Card className="card" onClick={() => history.push(`/pools/${item.id}`)}>
                                            <CardContent className="card-content">
                                                <Box className="vault-header" >
                                                    {
                                                        item.status.active ?
                                                            <Typography
                                                                color="textSecondary"
                                                                className="status"
                                                                style={{
                                                                    marginRight: 8
                                                                }}
                                                            >
                                                                {item.status.status}
                                                            </Typography> :
                                                            <Typography style={{
                                                                visibility: "hidden"
                                                            }}>
                                                            </Typography>
                                                    }
                                                    <Box>
                                                        <Typography
                                                            color="textSecondary"
                                                            className="description"
                                                        >
                                                            {item.sub_title}
                                                        </Typography>
                                                        <Tooltip arrow title={item.buy_tooltip}>
                                                            <Link underline="none" target="_blank" href={item.buy}>
                                                                <IconButton onClick={e => getLP(e, item)}>
                                                                    <ShoppingCartRoundedIcon color="primary" />
                                                                </IconButton>
                                                            </Link>
                                                        </Tooltip>
                                                    </Box>
                                                </Box>
                                                <Box className="pool-img">
                                                    {item.icons.map((icon, index) => (
                                                        <img key={index} src={icon} alt={icon} />
                                                    ))}
                                                </Box>
                                                <Box className="pool-title">
                                                    <Typography className="title">
                                                        {item.name}
                                                    </Typography>
                                                </Box>
                                                <Typography className="percentage">
                                                    {
                                                        item.id === "aumi-matic-lp-compounding" ? (
                                                            <>900% APR + {fn((apData[item.id] ? apData[item.id].A : 0) * 100, 2)}% APY</>
                                                        ) : (
                                                            <>{item.ap.title}{" "}{isNaN(ap[item.id]) ? "0%" : `${fn(ap[item.id], 2)}%`}</>
                                                        )
                                                    }
                                                    {/* {apData[item.id] && (
                                                        <Tooltip arrow placement="top" title={<><>LP APY: {fn(apData[item.id]["A"] * 100, 2)}%</><br /><>AUMI APY: {fn(((1 + apData[item.id]["B"] / 365) ** 365 - 1) * 100, 2)}% based on {fn(apData[item.id]["B"] * 100, 2)}% APR (Manual Daily Compounding)</></>}>
                                                            <InfoOutlinedIcon />
                                                        </Tooltip>
                                                    )} */}
                                                </Typography>
                                                <Typography
                                                    className="comment"
                                                    color="textSecondary"
                                                >
                                                    {item.description}
                                                </Typography>
                                                <Table className="lp-table">
                                                    <TableBody>
                                                        <TableRow>
                                                            <TableCell>Earn</TableCell>
                                                            <TableCell>
                                                                {item.rewards[0]}{(item.rewards[0] !== "" && item.rewards[1] !== "") && " + "}{item.rewards[1]}
                                                            </TableCell>
                                                        </TableRow>
                                                        <TableRow>
                                                            <TableCell>Balance</TableCell>
                                                            {(() => {
                                                                const balance = Number(eachBalance[item.id]) + Number(totalRewards[item.id]);
                                                                if (!isNaN(balance)) {
                                                                    if (balance > 0 && balance < 0.01) {
                                                                        return (
                                                                            <Tooltip arrow placement="top" title={<>{balance}</>}>
                                                                                <TableCell>${fn(balance, 2)}</TableCell>
                                                                            </Tooltip>
                                                                        )
                                                                    } else {
                                                                        return (
                                                                            <TableCell>${fn(balance, 2)}</TableCell>
                                                                        )
                                                                    }

                                                                } else {
                                                                    return <TableCell className="skelton"><Skeleton animation="wave" /></TableCell>
                                                                }
                                                            })()}
                                                        </TableRow>
                                                        <TableRow>
                                                            <TableCell>Total Deposit</TableCell>
                                                            {(() => {
                                                                const tDbalance = Number(totalDeposit[item.id]);
                                                                if (!isNaN(tDbalance)) {
                                                                    if (tDbalance > 0 && tDbalance < 0.01) {
                                                                        return (
                                                                            <Tooltip arrow placement="bottom" title={totalDeposit[item.id]}>
                                                                                <TableCell>${fn(tDbalance, 2)}</TableCell>
                                                                            </Tooltip>
                                                                        )
                                                                    } else {
                                                                        return (
                                                                            <TableCell>${fn(tDbalance, 2)}</TableCell>
                                                                        )
                                                                    }
                                                                } else {
                                                                    return <TableCell className="skelton"><Skeleton animation="wave" /></TableCell>
                                                                }
                                                            })()}
                                                        </TableRow>
                                                    </TableBody>
                                                </Table>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                )
                            }
                        })}
                    </Grid>
                </CardContent>
            </Card>
        </Container >
    )
}

export default Pools;
