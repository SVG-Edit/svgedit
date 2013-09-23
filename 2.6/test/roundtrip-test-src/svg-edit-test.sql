-- MySQL dump 10.13  Distrib 5.5.32, for debian-linux-gnu (x86_64)
--
-- Host: 192.168.123.1    Database: svg-edit-test
-- ------------------------------------------------------
-- Server version	5.5.32-0ubuntu0.12.04.1-log

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `TestResults`
--

DROP TABLE IF EXISTS `TestResults`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `TestResults` (
  `resultId` int(11) NOT NULL AUTO_INCREMENT,
  `svgId` int(11) NOT NULL,
  `browser` enum('IE','FF','Chrome','Safari','Opera') NOT NULL,
  `browserMajorVer` tinyint(4) NOT NULL,
  `browserVer` varchar(45) DEFAULT NULL,
  `svnRev` int(11) NOT NULL,
  `svg` mediumtext NOT NULL,
  `svgIsValid` bit(1) NOT NULL,
  `canonicalSvg` mediumtext,
  `nodeCount` int(11) NOT NULL,
  `attrCount` int(11) NOT NULL,
  `attrsLostList` varchar(200) NOT NULL,
  `png` mediumblob,
  `pngdiff` mediumblob,
  `rasterDiffMeanSquareError` decimal(6,6) NOT NULL,
  PRIMARY KEY (`resultId`),
  UNIQUE KEY `Unique` (`svgId`,`browser`,`svnRev`,`browserMajorVer`),
  KEY `fk_TestResults_svgId_idx` (`svgId`),
  CONSTRAINT `fk_TestResults_svgId` FOREIGN KEY (`svgId`) REFERENCES `Tests` (`svgId`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=4526 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Tests`
--

DROP TABLE IF EXISTS `Tests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Tests` (
  `svgId` int(11) NOT NULL AUTO_INCREMENT,
  `svgIsValid` bit(1) NOT NULL,
  `svg` mediumtext NOT NULL,
  `canonicalSvg` mediumtext NOT NULL,
  `nodeCount` int(11) NOT NULL,
  `attrCount` int(11) NOT NULL,
  `png` mediumblob NOT NULL,
  `commonsName` varchar(512) NOT NULL,
  `attrsList` text NOT NULL,
  PRIMARY KEY (`svgId`),
  UNIQUE KEY `CommonsName_UNIQUE` (`commonsName`)
) ENGINE=InnoDB AUTO_INCREMENT=349 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2013-09-22 20:10:53
